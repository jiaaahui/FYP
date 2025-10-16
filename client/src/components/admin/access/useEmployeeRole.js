import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../../firebase'; // Adjust path as needed

// Custom hook to fetch employee role from Firestore by email
function useEmployeeRole(email) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!email) {
        setRole(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const q = query(collection(db, "employees"), where("email", "==", email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const empData = snapshot.docs[0].data();
          setRole(empData.role || null);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Failed to fetch employee role:", error);
        setRole(null);
      }
      setLoading(false);
    }
    fetchRole();
  }, [email]);

  return { role, loading };
}

export default useEmployeeRole;