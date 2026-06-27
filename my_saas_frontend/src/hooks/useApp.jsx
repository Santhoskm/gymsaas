// // src/hooks/useApp.jsx

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
// } from "react";
// import {
//   clientsAPI,
//   trainersAPI,
//   expensesAPI,
//   activitiesAPI,
//   packagesAPI,
//   programsAPI,
//   dashboardAPI,
// } from "../services/api";
// import { getMembershipStatus } from "../utils";
// import toast from "react-hot-toast";

// const AppContext = createContext(null);

// export function AppProvider({ children }) {
//   const [clients, setClients] = useState([]);
//   const [trainers, setTrainers] = useState([]);
//   const [expenses, setExpenses] = useState([]);
//   const [activities, setActivities] = useState([]);
//   const [packages, setPackages] = useState([]);
//   const [programs, setPrograms] = useState([]);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loadingData, setLoadingData] = useState(true);

//   useEffect(() => {
//     const isLoggedIn = !!localStorage.getItem("authToken");
//     if (!isLoggedIn) {
//       setLoadingData(false);
//       return;
//     }
//     fetchAll();
//   }, []);

//   async function fetchAll() {
//     setLoadingData(true);
//     try {
//       const [c, t, e, a, p, prog, dash] = await Promise.all([
//         clientsAPI.list(),
//         trainersAPI.list(),
//         expensesAPI.list(),
//         activitiesAPI.list(),
//         packagesAPI.list(),
//         programsAPI.list(),
//         dashboardAPI.getStats(),
//       ]);
//       setClients((c || []).map(normalizeClient));
//       setTrainers(t || []);
//       setExpenses(e || []);
//       setActivities(a || []);
//       setPackages(p || []);
//       setPrograms(prog || []);
//       setDashboardData(dash || null);
//     } catch (err) {
//       console.error("Failed to load data:", err);
//     } finally {
//       setLoadingData(false);
//     }
//   }

//   // Backend uses snake_case — normalize to camelCase for the frontend
//   function normalizeClient(c) {
//     return {
//       ...c,
//       joinDate: c.join_date,
//       expiryDate: c.expiry_date,
//       packageId: c.package,
//       programPackageId: c.program_package,
//       trainerId: c.trainer,
//       personalTraining: c.personal_training,
//       paymentMethod: c.payment_method || "cash",
//       status: getMembershipStatus(c.expiry_date),
//     };
//   }

//   // ── Clients ───────────────────────────────────────────────────────────────
//   const addClient = useCallback(async (formData) => {
//     try {
//       const payload = {
//         name: formData.name,
//         phone: formData.phone,
//         email: formData.email,
//         address: formData.address,
//         join_date: formData.joinDate,
//         expiry_date: formData.expiryDate,
//         package: formData.packageId || null,
//         program_package: formData.programPackageId || null,
//         trainer: formData.trainerId || null,
//         personal_training: formData.personalTraining,
//         payment_method: formData.paymentMethod || "cash",
//       };
//       const newClient = await clientsAPI.create(payload);
//       setClients((prev) => [normalizeClient(newClient), ...prev]);
//       toast.success("Client added!");
//       return newClient;
//     } catch (err) {
//       toast.error(err.message || "Failed to add client");
//       throw err;
//     }
//   }, []);

//   const updateClient = useCallback(async (id, formData) => {
//     try {
//       const payload = {
//         name: formData.name,
//         phone: formData.phone,
//         email: formData.email,
//         address: formData.address,
//         join_date: formData.joinDate,
//         expiry_date: formData.expiryDate,
//         package: formData.packageId || null,
//         program_package: formData.programPackageId || null,
//         trainer: formData.trainerId || null,
//         personal_training: formData.personalTraining,
//         payment_method: formData.paymentMethod || "cash",
//       };
//       const updated = await clientsAPI.update(id, payload);
//       setClients((prev) =>
//         prev.map((c) => (c.id === id ? normalizeClient(updated) : c))
//       );
//       toast.success("Client updated!");
//     } catch (err) {
//       toast.error(err.message || "Failed to update client");
//       throw err;
//     }
//   }, []);

//   const deleteClient = useCallback(async (id) => {
//     try {
//       await clientsAPI.delete(id);
//       setClients((prev) => prev.filter((c) => c.id !== id));
//       toast.success("Client removed");
//     } catch (err) {
//       toast.error(err.message || "Failed to delete client");
//     }
//   }, []);

//   const addPayment = useCallback(async (clientId, paymentData) => {
//     try {
//       const updated = await clientsAPI.addPayment(clientId, paymentData);
//       setClients((prev) =>
//         prev.map((c) => (c.id === clientId ? normalizeClient(updated) : c))
//       );
//       toast.success("Payment recorded!");
//     } catch (err) {
//       toast.error(err.message || "Failed to add payment");
//       throw err;
//     }
//   }, []);

//   // Renew: extend expiry, keep same or new package — writes MembershipHistory action='renewal'/'upgrade'
//   const renewClient = useCallback(async (clientId, formData) => {
//     try {
//       const payload = {
//         expiry_date: formData.expiryDate,
//         program_package: formData.programPackageId || null,
//         trainer: formData.trainerId || null,
//         personal_training: formData.personalTraining ?? false,
//         amount_paid: formData.amountPaid || null,
//         payment_method: formData.paymentMethod || "cash",
//         note: formData.note || "",
//       };
//       const updated = await clientsAPI.renew(clientId, payload);
//       setClients((prev) =>
//         prev.map((c) => (c.id === clientId ? normalizeClient(updated) : c))
//       );
//       toast.success("Membership renewed!");
//       return updated;
//     } catch (err) {
//       toast.error(err.message || "Failed to renew membership");
//       throw err;
//     }
//   }, []);

//   // Upgrade: mid-cycle package change — calls same /renew/ endpoint with upgrade action
//   const upgradeClient = useCallback(async (clientId, formData) => {
//     try {
//       const payload = {
//         expiry_date: formData.expiryDate,
//         program_package: formData.programPackageId || null,
//         trainer: formData.trainerId || null,
//         personal_training: formData.personalTraining ?? false,
//         amount_paid: formData.amountPaid || null,
//         payment_method: formData.paymentMethod || "cash",
//         note: formData.note || "Package upgrade",
//       };
//       const updated = await clientsAPI.renew(clientId, payload);
//       setClients((prev) =>
//         prev.map((c) => (c.id === clientId ? normalizeClient(updated) : c))
//       );
//       toast.success("Package upgraded!");
//       return updated;
//     } catch (err) {
//       toast.error(err.message || "Failed to upgrade package");
//       throw err;
//     }
//   }, []);

//   // ── Trainers ──────────────────────────────────────────────────────────────
//   const addTrainer = useCallback(async (formData) => {
//     try {
//       const payload = {
//         name: formData.name,
//         phone: formData.phone,
//         email: formData.email,
//         specialty: formData.specialty,
//         salary: formData.salary,
//         joined: formData.joined,
//         status: formData.status || "active",
//         offers_personal_training: formData.offers_personal_training || false,
//       };
//       const newTrainer = await trainersAPI.create(payload);
//       setTrainers((prev) => [newTrainer, ...prev]);
//       toast.success("Trainer added!");
//     } catch (err) {
//       toast.error(err.message || "Failed to add trainer");
//       throw err;
//     }
//   }, []);

//   const updateTrainer = useCallback(async (id, formData) => {
//     try {
//       const payload = {
//         name: formData.name,
//         phone: formData.phone,
//         email: formData.email,
//         specialty: formData.specialty,
//         salary: formData.salary,
//         joined: formData.joined,
//         status: formData.status || "active",
//         offers_personal_training: formData.offers_personal_training || false,
//       };
//       const updated = await trainersAPI.update(id, payload);
//       setTrainers((prev) => prev.map((t) => (t.id === id ? updated : t)));
//       toast.success("Trainer updated!");
//     } catch (err) {
//       toast.error(err.message || "Failed to update trainer");
//       throw err;
//     }
//   }, []);

//   const deleteTrainer = useCallback(async (id) => {
//     try {
//       await trainersAPI.delete(id);
//       setTrainers((prev) => prev.filter((t) => t.id !== id));
//       toast.success("Trainer removed");
//     } catch (err) {
//       toast.error(err.message || "Failed to delete trainer");
//     }
//   }, []);

//   // ── Expenses ──────────────────────────────────────────────────────────────
//   const addExpense = useCallback(async (formData) => {
//     try {
//       const newExpense = await expensesAPI.create(formData);
//       setExpenses((prev) => [newExpense, ...prev]);
//       toast.success("Expense recorded!");
//     } catch (err) {
//       toast.error(err.message || "Failed to add expense");
//       throw err;
//     }
//   }, []);

//   const deleteExpense = useCallback(async (id) => {
//     try {
//       await expensesAPI.delete(id);
//       setExpenses((prev) => prev.filter((e) => e.id !== id));
//       toast.success("Expense removed");
//     } catch (err) {
//       toast.error(err.message || "Failed to delete expense");
//     }
//   }, []);

//   // ── Activities ────────────────────────────────────────────────────────────
//   const addActivity = useCallback(async (formData) => {
//     try {
//       const payload = {
//         name: formData.name,
//         duration: formData.duration,
//         gym_fee: formData.gymFee,
//         trainer_fee: formData.trainerFee,
//         description: formData.description,
//         icon: formData.icon,
//       };
//       const newActivity = await activitiesAPI.create(payload);
//       setActivities((prev) => [newActivity, ...prev]);
//       toast.success("Activity added!");
//     } catch (err) {
//       toast.error(err.message || "Failed to add activity");
//       throw err;
//     }
//   }, []);

//   const updateActivity = useCallback(async (id, formData) => {
//     try {
//       const payload = {
//         name: formData.name,
//         duration: formData.duration,
//         gym_fee: formData.gymFee,
//         trainer_fee: formData.trainerFee,
//         description: formData.description,
//         icon: formData.icon,
//       };
//       const updated = await activitiesAPI.update(id, payload);
//       setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
//       toast.success("Activity updated!");
//     } catch (err) {
//       toast.error(err.message || "Failed to update activity");
//       throw err;
//     }
//   }, []);

//   const deleteActivity = useCallback(async (id) => {
//     try {
//       await activitiesAPI.delete(id);
//       setActivities((prev) => prev.filter((a) => a.id !== id));
//       toast.success("Activity removed");
//     } catch (err) {
//       toast.error(err.message || "Failed to delete activity");
//     }
//   }, []);

//   // ── Programs (new) ────────────────────────────────────────────────────────
//   const addProgram = useCallback(async (formData) => {
//     try {
//       const newProgram = await programsAPI.create(formData);
//       setPrograms((prev) => [newProgram, ...prev]);
//       toast.success("Program added!");
//     } catch (err) {
//       toast.error(err.message || "Failed to add program");
//       throw err;
//     }
//   }, []);

//   const updateProgram = useCallback(async (id, formData) => {
//     try {
//       const updated = await programsAPI.update(id, formData);
//       setPrograms((prev) => prev.map((p) => (p.id === id ? updated : p)));
//       toast.success("Program updated!");
//     } catch (err) {
//       toast.error(err.message || "Failed to update program");
//       throw err;
//     }
//   }, []);

//   const deleteProgram = useCallback(async (id) => {
//     try {
//       await programsAPI.delete(id);
//       setPrograms((prev) => prev.filter((p) => p.id !== id));
//       toast.success("Program removed");
//     } catch (err) {
//       toast.error(err.message || "Failed to delete program");
//     }
//   }, []);

//   const addProgramPackage = useCallback(async (programId, formData) => {
//     try {
//       const updated = await programsAPI.addPackage(programId, formData);
//       setPrograms((prev) =>
//         prev.map((p) => (p.id === programId ? updated : p))
//       );
//       toast.success("Package added!");
//     } catch (err) {
//       toast.error(err.message || "Failed to add package");
//       throw err;
//     }
//   }, []);

//   const deleteProgramPackage = useCallback(async (programId, pkgId) => {
//     try {
//       await programsAPI.deletePackage(programId, pkgId);
//       setPrograms((prev) =>
//         prev.map((p) =>
//           p.id === programId
//             ? { ...p, packages: p.packages.filter((pk) => pk.id !== pkgId) }
//             : p
//         )
//       );
//       toast.success("Package removed");
//     } catch (err) {
//       toast.error(err.message || "Failed to remove package");
//     }
//   }, []);

//   // ── Computed stats from live data ─────────────────────────────────────────
//   const now = new Date();
//   const stats = {
//     totalClients: clients.length,
//     activeClients: clients.filter((c) => c.status === "active").length,
//     newClientsThisMonth: clients.filter((c) => {
//       const joined = new Date(c.joinDate);
//       return (
//         joined.getMonth() === now.getMonth() &&
//         joined.getFullYear() === now.getFullYear()
//       );
//     }).length,
//     ptClients: clients.filter((c) => c.personalTraining).length,
//     expiringClients: clients.filter((c) => c.status === "expiring"),
//     expiredClients: clients.filter((c) => c.status === "expired"),
//     monthlyRevenue: clients.reduce((acc, c) => {
//       const lastPayment = c.payments?.[c.payments.length - 1];
//       return acc + (lastPayment?.amount || 0);
//     }, 0),
//     monthlyExpenses: expenses
//       .filter((e) =>
//         e.date?.startsWith(
//           `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
//         )
//       )
//       .reduce((acc, e) => acc + Number(e.amount), 0),
//   };

//   return (
//     <AppContext.Provider
//       value={{
//         // Clients
//         clients,
//         addClient,
//         updateClient,
//         deleteClient,
//         addPayment,
//         renewClient,
//         upgradeClient,
//         // Trainers
//         trainers,
//         addTrainer,
//         updateTrainer,
//         deleteTrainer,
//         // Expenses
//         expenses,
//         addExpense,
//         deleteExpense,
//         // Activities
//         activities,
//         addActivity,
//         updateActivity,
//         deleteActivity,
//         // Packages
//         packages,
//         // Programs (new)
//         programs,
//         addProgram,
//         updateProgram,
//         deleteProgram,
//         addProgramPackage,
//         deleteProgramPackage,
//         // Dashboard
//         dashboardData,
//         // Stats
//         stats,
//         loadingData,
//         refetchAll: fetchAll,
//       }}
//     >
//       {children}
//     </AppContext.Provider>
//   );
// }

// export const useApp = () => {
//   const ctx = useContext(AppContext);
//   if (!ctx) throw new Error("useApp must be used within AppProvider");
//   return ctx;
// };

// src/hooks/useApp.jsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  clientsAPI,
  trainersAPI,
  expensesAPI,
  activitiesAPI,
  packagesAPI,
  programsAPI,
  dashboardAPI,
} from "../services/api";
import { getMembershipStatus } from "../utils";
import toast from "react-hot-toast";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [clients, setClients] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [packages, setPackages] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem("authToken");
    if (!isLoggedIn) {
      setLoadingData(false);
      return;
    }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoadingData(true);
    try {
      const [c, t, e, a, p, prog, dash] = await Promise.all([
        clientsAPI.list(),
        trainersAPI.list(),
        expensesAPI.list(),
        activitiesAPI.list(),
        packagesAPI.list(),
        programsAPI.list(),
        dashboardAPI.getStats(),
      ]);
      setClients((c || []).map(normalizeClient));
      setTrainers(t || []);
      // setExpenses(e || []);
      setExpenses(e?.expenses ?? (Array.isArray(e) ? e : []));
      setActivities(a || []);
      setPackages(p || []);
      setPrograms(prog || []);
      setDashboardData(dash || null);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoadingData(false);
    }
  }

  function normalizeClient(c) {
    return {
      ...c,
      joinDate: c.join_date,
      expiryDate: c.expiry_date,
      packageId: c.package,
      programPackageId: c.program_package,
      trainerId: c.trainer,
      personalTraining: c.personal_training,
      paymentMethod: c.payment_method || "cash",
      status: getMembershipStatus(c.expiry_date),
    };
  }

  // ── Clients ───────────────────────────────────────────────────────────────

  const addClient = useCallback(async (formData) => {
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        join_date: formData.joinDate,
        expiry_date: formData.expiryDate,
        package: formData.packageId || null,
        program_package: formData.programPackageId || null,
        trainer: formData.trainerId || null,
        personal_training: formData.personalTraining,
        payment_method: formData.paymentMethod || "cash",
        // Pass amount paid so the serializer creates a Payment record and
        // sets recognized_month = expiry_date (deferred revenue)
        amount_paid: formData.amountPaid ? Number(formData.amountPaid) : null,
      };
      const newClient = await clientsAPI.create(payload);
      setClients((prev) => [normalizeClient(newClient), ...prev]);
      toast.success("Client added!");
      return newClient;
    } catch (err) {
      toast.error(err.message || "Failed to add client");
      throw err;
    }
  }, []);

  const updateClient = useCallback(async (id, formData) => {
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        join_date: formData.joinDate,
        expiry_date: formData.expiryDate,
        package: formData.packageId || null,
        program_package: formData.programPackageId || null,
        trainer: formData.trainerId || null,
        personal_training: formData.personalTraining,
        payment_method: formData.paymentMethod || "cash",
      };
      const updated = await clientsAPI.update(id, payload);
      setClients((prev) =>
        prev.map((c) => (c.id === id ? normalizeClient(updated) : c))
      );
      toast.success("Client updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update client");
      throw err;
    }
  }, []);

  const deleteClient = useCallback(async (id) => {
    try {
      await clientsAPI.delete(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Client removed");
    } catch (err) {
      toast.error(err.message || "Failed to delete client");
    }
  }, []);

  const addPayment = useCallback(async (clientId, paymentData) => {
    try {
      const updated = await clientsAPI.addPayment(clientId, paymentData);
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? normalizeClient(updated) : c))
      );
      toast.success("Payment recorded!");
    } catch (err) {
      toast.error(err.message || "Failed to add payment");
      throw err;
    }
  }, []);

  /**
   * renewClient — extend membership expiry.
   * Revenue is attributed to the new expiry month (last month of the period).
   */
  const renewClient = useCallback(async (clientId, formData) => {
    try {
      const payload = {
        expiry_date: formData.expiryDate,
        program_package: formData.programPackageId || null,
        trainer: formData.trainerId || null,
        personal_training: formData.personalTraining ?? false,
        amount_paid: formData.amountPaid ? Number(formData.amountPaid) : null,
        payment_method: formData.paymentMethod || "cash",
        note: formData.note || "",
        action: "renewal",
      };
      const updated = await clientsAPI.renew(clientId, payload);
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? normalizeClient(updated) : c))
      );
      toast.success("Membership renewed!");
      return updated;
    } catch (err) {
      toast.error(err.message || "Failed to renew membership");
      throw err;
    }
  }, []);

  /**
   * upgradeClient — change the package (and optionally extend expiry).
   * Revenue is attributed to the new expiry month.
   */
  const upgradeClient = useCallback(async (clientId, formData) => {
    try {
      const payload = {
        expiry_date: formData.expiryDate,
        program_package: formData.programPackageId || null,
        trainer: formData.trainerId || null,
        personal_training: formData.personalTraining ?? false,
        amount_paid: formData.amountPaid ? Number(formData.amountPaid) : null,
        payment_method: formData.paymentMethod || "cash",
        note: formData.note || "Package upgrade",
        action: "upgrade",
      };
      const updated = await clientsAPI.renew(clientId, payload);
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? normalizeClient(updated) : c))
      );
      toast.success("Package upgraded!");
      return updated;
    } catch (err) {
      toast.error(err.message || "Failed to upgrade package");
      throw err;
    }
  }, []);

  /**
   * addAddon — add a mid-cycle program (e.g. personal training) without
   * changing the base expiry date.
   * Revenue is attributed to the CURRENT month (not deferred).
   */
  const addAddon = useCallback(async (clientId, formData) => {
    try {
      const payload = {
        program_package: formData.programPackageId || null,
        trainer: formData.trainerId || null,
        personal_training: formData.personalTraining ?? false,
        amount_paid: formData.amountPaid ? Number(formData.amountPaid) : null,
        payment_method: formData.paymentMethod || "cash",
        note: formData.note || "Add-on program",
        action: "addon",
      };
      const updated = await clientsAPI.renew(clientId, payload);
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? normalizeClient(updated) : c))
      );
      toast.success("Add-on program added!");
      return updated;
    } catch (err) {
      toast.error(err.message || "Failed to add program");
      throw err;
    }
  }, []);

  // ── Trainers ──────────────────────────────────────────────────────────────

  const addTrainer = useCallback(async (formData) => {
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        specialty: formData.specialty,
        salary: formData.salary,
        joined: formData.joined,
        status: formData.status || "active",
        offers_personal_training: formData.offers_personal_training || false,
      };
      const newTrainer = await trainersAPI.create(payload);
      setTrainers((prev) => [newTrainer, ...prev]);
      toast.success("Trainer added!");
    } catch (err) {
      toast.error(err.message || "Failed to add trainer");
      throw err;
    }
  }, []);

  const updateTrainer = useCallback(async (id, formData) => {
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        specialty: formData.specialty,
        salary: formData.salary,
        joined: formData.joined,
        status: formData.status || "active",
        offers_personal_training: formData.offers_personal_training || false,
      };
      const updated = await trainersAPI.update(id, payload);
      setTrainers((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success("Trainer updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update trainer");
      throw err;
    }
  }, []);

  const deleteTrainer = useCallback(async (id) => {
    try {
      await trainersAPI.delete(id);
      setTrainers((prev) => prev.filter((t) => t.id !== id));
      toast.success("Trainer removed");
    } catch (err) {
      toast.error(err.message || "Failed to delete trainer");
    }
  }, []);

  // ── Expenses ──────────────────────────────────────────────────────────────

  // UI shows human labels ("Trainer Salary"); backend model only accepts these choice keys
  const expenseTypeMap = {
    "Trainer Salary": "trainer_salary",
    Equipment: "equipment",
    Utilities: "utilities",
    Maintenance: "maintenance",
    Marketing: "marketing",
    Supplies: "supplies",
    Rent: "rent",
    Other: "other",
  };

  const addExpense = useCallback(async (formData) => {
    try {
      const payload = {
        type: expenseTypeMap[formData.type] || formData.type,
        description: formData.description,
        amount: formData.amount,
        date: formData.date,
        trainer: formData.trainerId || null,
      };
      const newExpense = await expensesAPI.create(payload);
      setExpenses((prev) => [newExpense, ...prev]);
      toast.success("Expense recorded!");
    } catch (err) {
      toast.error(err.message || "Failed to add expense");
      throw err;
    }
  }, []);

  const deleteExpense = useCallback(async (id) => {
    try {
      await expensesAPI.delete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success("Expense removed");
    } catch (err) {
      toast.error(err.message || "Failed to delete expense");
    }
  }, []);

  // ── Activities ────────────────────────────────────────────────────────────

  const addActivity = useCallback(async (formData) => {
    try {
      const payload = {
        name: formData.name,
        duration: formData.duration,
        gym_fee: formData.gymFee,
        trainer_fee: formData.trainerFee,
        description: formData.description,
        icon: formData.icon,
      };
      const newActivity = await activitiesAPI.create(payload);
      setActivities((prev) => [newActivity, ...prev]);
      toast.success("Activity added!");
    } catch (err) {
      toast.error(err.message || "Failed to add activity");
      throw err;
    }
  }, []);

  const updateActivity = useCallback(async (id, formData) => {
    try {
      const payload = {
        name: formData.name,
        duration: formData.duration,
        gym_fee: formData.gymFee,
        trainer_fee: formData.trainerFee,
        description: formData.description,
        icon: formData.icon,
      };
      const updated = await activitiesAPI.update(id, payload);
      setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success("Activity updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update activity");
      throw err;
    }
  }, []);

  const deleteActivity = useCallback(async (id) => {
    try {
      await activitiesAPI.delete(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      toast.success("Activity removed");
    } catch (err) {
      toast.error(err.message || "Failed to delete activity");
    }
  }, []);

  // ── Programs ──────────────────────────────────────────────────────────────

  const addProgram = useCallback(async (formData) => {
    try {
      const newProgram = await programsAPI.create(formData);
      setPrograms((prev) => [newProgram, ...prev]);
      toast.success("Program added!");
    } catch (err) {
      toast.error(err.message || "Failed to add program");
      throw err;
    }
  }, []);

  const updateProgram = useCallback(async (id, formData) => {
    try {
      const updated = await programsAPI.update(id, formData);
      setPrograms((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast.success("Program updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update program");
      throw err;
    }
  }, []);

  const deleteProgram = useCallback(async (id) => {
    try {
      await programsAPI.delete(id);
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      toast.success("Program removed");
    } catch (err) {
      toast.error(err.message || "Failed to delete program");
    }
  }, []);

  const addProgramPackage = useCallback(async (programId, formData) => {
    try {
      const updated = await programsAPI.addPackage(programId, formData);
      setPrograms((prev) =>
        prev.map((p) => (p.id === programId ? updated : p))
      );
      toast.success("Package added!");
    } catch (err) {
      toast.error(err.message || "Failed to add package");
      throw err;
    }
  }, []);

  const deleteProgramPackage = useCallback(async (programId, pkgId) => {
    try {
      await programsAPI.deletePackage(programId, pkgId);
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === programId
            ? { ...p, packages: p.packages.filter((pk) => pk.id !== pkgId) }
            : p
        )
      );
      toast.success("Package removed");
    } catch (err) {
      toast.error(err.message || "Failed to remove package");
    }
  }, []);

  // ── Computed stats from live data ─────────────────────────────────────────
  const now = new Date();
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === "active").length,
    newClientsThisMonth: clients.filter((c) => {
      const joined = new Date(c.joinDate);
      return (
        joined.getMonth() === now.getMonth() &&
        joined.getFullYear() === now.getFullYear()
      );
    }).length,
    ptClients: clients.filter((c) => c.personalTraining).length,
    expiringClients: clients.filter((c) => c.status === "expiring"),
    expiredClients: clients.filter((c) => c.status === "expired"),
    monthlyRevenue: clients.reduce((acc, c) => {
      const lastPayment = c.payments?.[c.payments.length - 1];
      return acc + (lastPayment?.amount || 0);
    }, 0),
    monthlyExpenses: expenses
      .filter((e) =>
        e.date?.startsWith(
          `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
        )
      )
      .reduce((acc, e) => acc + Number(e.amount), 0),
  };

  return (
    <AppContext.Provider
      value={{
        // Clients
        clients,
        addClient,
        updateClient,
        deleteClient,
        addPayment,
        renewClient,
        upgradeClient,
        addAddon,
        // Trainers
        trainers,
        addTrainer,
        updateTrainer,
        deleteTrainer,
        // Expenses
        expenses,
        addExpense,
        deleteExpense,
        // Activities
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        // Packages
        packages,
        // Programs
        programs,
        addProgram,
        updateProgram,
        deleteProgram,
        addProgramPackage,
        deleteProgramPackage,
        // Dashboard
        dashboardData,
        // Stats
        stats,
        loadingData,
        refetchAll: fetchAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};