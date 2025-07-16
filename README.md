# Enhanced Logistics System for Electrical Appliance Industry

## Overview

This repository contains the source code for the Enhanced Logistics System for the Electrical Appliance Industry. The system is designed to streamline and optimize the scheduling, delivery, and installation of electrical appliances, with features supporting real-time task management, route optimization, and comprehensive analytics for both operational teams and administrators.

## Features

- **Authentication Module:**  
  Secure user registration, login, password reset, and account management.

- **Scheduling Module:**  
  Automated estimation of delivery and installation times, truck and route optimization, dynamic time slot assignment, and conflict filtering based on residential and logistical constraints.

- **Task View Module:**  
  Personalized dashboards for warehouse loading teams, delivery teams, and outsourced installers to access their specific schedules and route recommendations.

- **Manual Control and Monitoring Module:**  
  Admin interfaces for managing delivery schedules, team assignments, and resolving user-submitted reports or complaints.

- **Dashboard and Analytics Module:**  
  Performance monitoring for employees and order fulfillment, including punctuality rates and task completion statistics.

## System Architecture

The solution is structured as a web-based platform, with potential for mobile extension. It utilizes JavaScript as the primary language, with supplementary CSS and HTML for frontend styling and structure.

## UML & Documentation

- **Class and Use Case Diagrams:**  
  The system design is modeled using UML class diagrams to represent the main entities (Customer, Order, Product, Team, etc.) and their relationships. Use case diagrams illustrate the interactions between users (customers, delivery teams, admins) and the system, covering all major scenarios.

- **Activity Diagrams:**  
  Key workflows, such as authentication, scheduling, and team management, are detailed with activity diagrams to visualize process logic and decision points.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jiaaahui/FYP.git
   cd FYP
   ```

2. **Install dependencies:**
   (Assuming use of npm; update as needed for your stack)
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000` by default.

## Usage

- **For Customers:**  
  Register or log in to manage orders, track deliveries, reschedule appointments, and receive notifications.

- **For Delivery Teams:**  
  Access and update assigned delivery and installation schedules, view optimal routes, and upload proof of completed tasks.

- **For Admins:**  
  Oversee and edit schedules, assign teams, resolve reports, and analyze performance metrics via the analytics dashboard.

## Quality Requirements

- User credentials are stored encrypted, with enforced secure password policies.
- The system is designed for usability, targeting a PSSUQ score of at least 5.0/7.0.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request, or open an issue for suggestions and bug reports.

## License

[Specify your license here, e.g., MIT License.]

## Contact

For questions or support, please contact [your email or GitHub profile link].
