// src/hooks/useApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// App state — now fetches from backend API.
// All hardcoded arrays removed. gym_id isolation is handled by the backend.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clientsAPI, trainersAPI, expensesAPI, activitiesAPI, packagesAPI } from '../services/api';
import { getMembershipStatus } from '../utils';
import toast from 'react-hot-toast';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [clients, setClients] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ── Initial load — fetch everything from backend ──────────────────────────
  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem('authToken');
    if (!isLoggedIn) {
      setLoadingData(false);
      return;
    }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoadingData(true);
    try {
      const [c, t, e, a, p] = await Promise.all([
        clientsAPI.list(),
        trainersAPI.list(),
        expensesAPI.list(),
        activitiesAPI.list(),
        packagesAPI.list(),
      ]);
      // Backend returns snake_case — map expiry_date to status on frontend
      setClients((c || []).map(normalizeClient));
      setTrainers(t || []);
      setExpenses(e || []);
      setActivities(a || []);
      setPackages(p || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoadingData(false);
    }
  }

  // Backend uses snake_case, frontend uses camelCase — normalize here
  function normalizeClient(c) {
    return {
      ...c,
      joinDate: c.join_date,
      expiryDate: c.expiry_date,
      packageId: c.package,
      trainerId: c.trainer,
      personalTraining: c.personal_training,
      status: getMembershipStatus(c.expiry_date),
    };
  }

  // ── Clients ───────────────────────────────────────────────────────────────
  const addClient = useCallback(async (formData) => {
    try {
      // Map camelCase form fields to snake_case for Django
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        join_date: formData.joinDate,
        expiry_date: formData.expiryDate,
        package: formData.packageId || null,
        trainer: formData.trainerId || null,
        personal_training: formData.personalTraining,
      };
      const newClient = await clientsAPI.create(payload);
      setClients((prev) => [normalizeClient(newClient), ...prev]);
      toast.success('Client added!');
      return newClient;
    } catch (err) {
      toast.error(err.message || 'Failed to add client');
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
        trainer: formData.trainerId || null,
        personal_training: formData.personalTraining,
      };
      const updated = await clientsAPI.update(id, payload);
      setClients((prev) =>
        prev.map((c) => (c.id === id ? normalizeClient(updated) : c))
      );
      toast.success('Client updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update client');
      throw err;
    }
  }, []);

  const deleteClient = useCallback(async (id) => {
    try {
      await clientsAPI.delete(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success('Client removed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete client');
    }
  }, []);

  const addPayment = useCallback(async (clientId, paymentData) => {
    try {
      const updated = await clientsAPI.addPayment(clientId, paymentData);
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? normalizeClient(updated) : c))
      );
      toast.success('Payment recorded!');
    } catch (err) {
      toast.error(err.message || 'Failed to add payment');
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
        status: formData.status || 'active',
      };
      const newTrainer = await trainersAPI.create(payload);
      setTrainers((prev) => [newTrainer, ...prev]);
      toast.success('Trainer added!');
    } catch (err) {
      toast.error(err.message || 'Failed to add trainer');
      throw err;
    }
  }, []);

  const updateTrainer = useCallback(async (id, formData) => {
    try {
      const updated = await trainersAPI.update(id, formData);
      setTrainers((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success('Trainer updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update trainer');
      throw err;
    }
  }, []);

  const deleteTrainer = useCallback(async (id) => {
    try {
      await trainersAPI.delete(id);
      setTrainers((prev) => prev.filter((t) => t.id !== id));
      toast.success('Trainer removed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete trainer');
    }
  }, []);

  // ── Expenses ──────────────────────────────────────────────────────────────
  const addExpense = useCallback(async (formData) => {
    try {
      const newExpense = await expensesAPI.create(formData);
      setExpenses((prev) => [newExpense, ...prev]);
      toast.success('Expense recorded!');
    } catch (err) {
      toast.error(err.message || 'Failed to add expense');
      throw err;
    }
  }, []);

  const deleteExpense = useCallback(async (id) => {
    try {
      await expensesAPI.delete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success('Expense removed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete expense');
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
      toast.success('Activity added!');
    } catch (err) {
      toast.error(err.message || 'Failed to add activity');
      throw err;
    }
  }, []);

  const updateActivity = useCallback(async (id, formData) => {
    try {
      const updated = await activitiesAPI.update(id, formData);
      setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success('Activity updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update activity');
      throw err;
    }
  }, []);

  const deleteActivity = useCallback(async (id) => {
    try {
      await activitiesAPI.delete(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      toast.success('Activity removed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete activity');
    }
  }, []);

  // ── Computed stats (from live data) ───────────────────────────────────────
  const now = new Date();
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === 'active').length,
    newClientsThisMonth: clients.filter((c) => {
      const joined = new Date(c.joinDate);
      return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length,
    ptClients: clients.filter((c) => c.personalTraining).length,
    expiringClients: clients.filter((c) => c.status === 'expiring'),
    expiredClients: clients.filter((c) => c.status === 'expired'),
    monthlyRevenue: clients.reduce((acc, c) => {
      const lastPayment = c.payments?.[c.payments.length - 1];
      return acc + (lastPayment?.amount || 0);
    }, 0),
    monthlyExpenses: expenses
      .filter((e) => e.date?.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`))
      .reduce((acc, e) => acc + Number(e.amount), 0),
  };

  return (
    <AppContext.Provider
      value={{
        clients, addClient, updateClient, deleteClient, addPayment,
        trainers, addTrainer, updateTrainer, deleteTrainer,
        expenses, addExpense, deleteExpense,
        activities, addActivity, updateActivity, deleteActivity,
        packages,
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
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};