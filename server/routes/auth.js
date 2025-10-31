// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../prismaClient');

// Helper: pick safe employee fields to return (no password)
function safeEmployee(emp) {
  if (!emp) return null;
  const { password, ...rest } = emp;
  return rest;
}

// POST /api/auth/login
// Body: { email, password }
// Validates employee credentials and returns employee data (no token needed for session storage approach)
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  console.log(`🔐 Login attempt for email: ${email}`);
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    console.log('Attempting to find employee in database...');
    // Find employee by email (case-insensitive)
    const employee = await prisma.employee.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' }
      },
      include: {
        role: true // Include role information for permissions
      }
    });
    console.log('Employee found:', employee ? 'YES' : 'NO');

    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if employee account is active
    if (!employee.activeFlag) {
      return res.status(403).json({ error: 'This employee account has been deactivated' });
    }

    // Check if password is set
    const hash = employee.password;
    if (!hash) {
      return res.status(401).json({ error: 'No password set for this account. Please contact an administrator.' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return safe employee object (without password)
    return res.json({ 
      success: true, 
      employee: safeEmployee(employee),
      message: 'Login successful' 
    });
  } catch (err) {
    console.error('POST /api/auth/login error', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/reset-request
// Body: { email }
// Generates a password reset token and stores it in the database
// In production, this token should be sent via email to the employee
router.post('/reset-request', async (req, res) => {
  const { email } = req.body || {};
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Find employee by email
    const employee = await prisma.employee.findFirst({
      where: { 
        email: { equals: email, mode: 'insensitive' } 
      }
    });

    // For security, always return success even if email doesn't exist
    // This prevents email enumeration attacks
    if (!employee) {
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }

    // Check if employee is active
    if (!employee.activeFlag) {
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Token expires in 1 hour

    // Delete any existing reset tokens for this employee
    await prisma.passwordReset.deleteMany({
      where: { employeeID: employee.id }
    });

    // Create new password reset record
    await prisma.passwordReset.create({
      data: {
        token: resetToken,
        employeeID: employee.id,
        expiresAt: expiresAt
      }
    });

    // TODO: Send email with reset link
    // Example: https://your-app.com/reset-password?token=${resetToken}
    // For now, log the token (REMOVE THIS IN PRODUCTION)
    console.log(`🔑 Password reset token for ${employee.email}: ${resetToken}`);
    console.log(`⏰ Token expires at: ${expiresAt.toISOString()}`);
    console.log(`🔗 Reset link: http://localhost:3000/reset-password?token=${resetToken}`);

    return res.json({ 
      success: true, 
      message: 'If an account exists with this email, a password reset link has been sent.',
      // REMOVE THIS IN PRODUCTION - only for testing
      token: resetToken 
    });
  } catch (err) {
    console.error('POST /api/auth/reset-request error', err);
    res.status(500).json({ error: 'Server error during password reset request' });
  }
});

// POST /api/auth/reset-confirm
// Body: { token, newPassword }
// Validates the reset token and updates the employee's password
router.post('/reset-confirm', async (req, res) => {
  const { token, newPassword } = req.body || {};
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Find the reset token
    const resetRecord = await prisma.passwordReset.findUnique({ 
      where: { token },
      include: {
        employee: true
      }
    });

    // Check if token exists and is not expired
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if employee is still active
    if (!resetRecord.employee.activeFlag) {
      return res.status(403).json({ error: 'This employee account has been deactivated' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update employee's password
    await prisma.employee.update({
      where: { id: resetRecord.employeeID },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    // Delete the used reset token
    await prisma.passwordReset.delete({
      where: { token }
    });

    console.log(`✅ Password successfully reset for employee: ${resetRecord.employee.email}`);

    return res.json({ 
      success: true, 
      message: 'Password has been successfully reset. You can now log in with your new password.' 
    });
  } catch (err) {
    console.error('POST /api/auth/reset-confirm error', err);
    res.status(500).json({ error: 'Server error during password reset confirmation' });
  }
});

// POST /api/auth/verify-session
// Body: { employeeId }
// Verifies that the session is still valid by checking if employee exists and is active
router.post('/verify-session', async (req, res) => {
  const { employeeId } = req.body || {};
  
  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        role: true
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (!employee.activeFlag) {
      return res.status(403).json({ error: 'This employee account has been deactivated' });
    }

    return res.json({ 
      success: true, 
      employee: safeEmployee(employee) 
    });
  } catch (err) {
    console.error('POST /api/auth/verify-session error', err);
    res.status(500).json({ error: 'Server error during session verification' });
  }
});

module.exports = router;