import React, { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from './DashboardHeader';
import {
  createId,
  Expense,
  ExpenseCategory,
  getDateOffset,
  loadMoney,
  MoneyData,
  saveMoney,
} from '../utils/dashboardStorage';

const categories: ExpenseCategory[] = ['FOOD', 'TRAVEL', 'COLLEGE', 'SHOPPING', 'OTHER'];
const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const MoneySection: React.FC = () => {
  const [data, setData] = useState(loadMoney);
  const [budgetInput, setBudgetInput] = useState(`${data.monthlyBudget}`);
  const [spentInput, setSpentInput] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState('');
  const [spentError, setSpentError] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('FOOD');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [affordAmount, setAffordAmount] = useState('');

  const monthKey = `${new Date().getFullYear()}-${`${new Date().getMonth() + 1}`.padStart(2, '0')}`;
  const monthExpenses = useMemo(
    () => data.expenses.filter((expense) => expense.date.slice(0, 7) === monthKey),
    [data.expenses, monthKey],
  );
  const itemizedSpent = monthExpenses.reduce((total, expense) => total + expense.amount, 0);
  const spent = Object.prototype.hasOwnProperty.call(data.monthlySpentOverrides ?? {}, monthKey)
    ? data.monthlySpentOverrides?.[monthKey] ?? 0
    : itemizedSpent;
  const remaining = data.monthlyBudget - spent;
  const budgetUsed = data.monthlyBudget === 0 ? 0 : Math.min(100, (spent / data.monthlyBudget) * 100);
  const recentExpenses = [...monthExpenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const categoryTotals = categories.map((category) => ({
    category,
    total: monthExpenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0),
  }));
  const highestCategory = Math.max(...categoryTotals.map((item) => item.total), 0);

  const updateData = (nextData: MoneyData) => {
    setData(nextData);
    saveMoney(nextData);
  };

  const updateBudget = (value: string) => {
    setBudgetInput(value);
    if (!value.trim()) {
      setBudgetError('');
      return;
    }
    const monthlyBudget = Number(value);
    if (!Number.isFinite(monthlyBudget) || monthlyBudget < 0) {
      setBudgetError('Enter an amount of ₹0 or more.');
      return;
    }
    setBudgetError('');
    updateData({ ...data, monthlyBudget });
  };

  const updateSpent = (value: string) => {
    setSpentInput(value);
    if (!value.trim()) {
      setSpentError('');
      return;
    }
    const monthlySpent = Number(value);
    if (!Number.isFinite(monthlySpent) || monthlySpent < 0) {
      setSpentError('Enter an amount of ₹0 or more.');
      return;
    }
    setSpentError('');
    updateData({
      ...data,
      monthlySpentOverrides: {
        ...data.monthlySpentOverrides,
        [monthKey]: monthlySpent,
      },
    });
  };

  const addExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(expenseAmount);
    const description = expenseDescription.trim();
    if (!Number.isFinite(amount) || amount <= 0 || !description) return;

    const expense: Expense = {
      id: createId(),
      amount,
      category: expenseCategory,
      description,
      date: getDateOffset(0),
    };
    const nextData: MoneyData = { ...data, expenses: [expense, ...data.expenses] };
    if (Object.prototype.hasOwnProperty.call(data.monthlySpentOverrides ?? {}, monthKey)) {
      nextData.monthlySpentOverrides = {
        ...data.monthlySpentOverrides,
        [monthKey]: spent + amount,
      };
      setSpentInput(`${spent + amount}`);
    }
    updateData(nextData);
    setExpenseAmount('');
    setExpenseDescription('');
  };

  const formatMoney = (amount: number) => currency.format(amount);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <DashboardHeader
        eyebrow="YOUR MONEY, WITHOUT THE GUESSWORK"
        title="MONEY"
        description="Set a monthly guardrail, log the little things, and know what is actually left before you say yes."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <motion.section whileHover={{ y: -3 }} className="glass-card p-5 sm:p-6">
          <label htmlFor="monthly-budget" className="text-[10px] font-bold tracking-[0.18em] text-beige">
            MONTHLY BUDGET
          </label>
          <div className="relative mt-3">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-butter">₹</span>
            <input
              id="monthly-budget"
              aria-label="Monthly budget in Indian rupees"
              aria-invalid={Boolean(budgetError)}
              className="w-full rounded-lg border border-butter/20 bg-espresso/50 py-3 pl-9 pr-3 font-display text-2xl font-bold text-cream transition-colors placeholder:text-beige/40 focus:border-butter/60 focus:outline-none focus:ring-2 focus:ring-butter/20"
              min="0"
              onBlur={() => {
                setBudgetInput(`${data.monthlyBudget}`);
                setBudgetError('');
              }}
              onChange={(event) => updateBudget(event.target.value)}
              placeholder="Set your budget"
              step="0.01"
              type="number"
              value={budgetInput}
            />
          </div>
          <p className="mt-2 text-xs text-beige">Edit your monthly limit</p>
          {budgetError && <p aria-live="polite" className="mt-2 text-xs text-red-200">{budgetError}</p>}
        </motion.section>

        <motion.section whileHover={{ y: -3 }} className="glass-card p-5 sm:p-6">
          <label htmlFor="spent-this-month" className="text-[10px] font-bold tracking-[0.18em] text-beige">
            SPENT THIS MONTH
          </label>
          <div className="relative mt-3">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-butter">₹</span>
            <input
              id="spent-this-month"
              aria-label="Amount spent this month in Indian rupees"
              aria-invalid={Boolean(spentError)}
              className="w-full rounded-lg border border-butter/20 bg-espresso/50 py-3 pl-9 pr-3 font-display text-2xl font-bold text-butter transition-colors placeholder:text-beige/40 focus:border-butter/60 focus:outline-none focus:ring-2 focus:ring-butter/20"
              min="0"
              onBlur={() => {
                setSpentInput(null);
                setSpentError('');
              }}
              onChange={(event) => updateSpent(event.target.value)}
              placeholder="Enter spending"
              step="0.01"
              type="number"
              value={spentInput ?? `${spent}`}
            />
          </div>
          <p className="mt-2 text-xs text-beige">Editable total · logged expenses stay itemized</p>
          {spentError && <p aria-live="polite" className="mt-2 text-xs text-red-200">{spentError}</p>}
        </motion.section>

        <motion.section whileHover={{ y: -3 }} className="glass-card p-5 sm:p-6">
          <p className="text-[10px] font-bold tracking-[0.18em] text-beige">LEFT TO SPEND</p>
          <motion.p
            key={remaining}
            initial={{ opacity: 0.6, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className={`number-display mt-3 break-words font-display text-3xl font-bold ${remaining < 0 ? 'text-red-200' : 'text-cream'}`}
          >
            {formatMoney(remaining)}
          </motion.p>
          <p className="mt-2 text-xs text-beige">Monthly budget minus spending</p>
        </motion.section>
      </div>

      <section className="glass-card mb-6 p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <motion.p
            key={Math.round(budgetUsed)}
            initial={{ opacity: 0.6, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="text-sm font-medium text-cream"
          >
            {Math.round(budgetUsed)}% of your budget used
          </motion.p>
          <p className="text-xs text-beige">{formatMoney(Math.max(0, remaining))} remaining</p>
        </div>
        <div
          aria-label={`${Math.round(budgetUsed)} percent of monthly budget used`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(budgetUsed)}
          className="h-2 overflow-hidden rounded-full bg-espresso/70"
          role="progressbar"
        >
          <div
            className={`h-full rounded-full shadow-[0_0_14px_rgba(200,241,105,0.24)] transition-[width] duration-700 ease-out ${spent > data.monthlyBudget ? 'bg-red-300' : 'bg-butter'}`}
            style={{ width: `${budgetUsed}%` }}
          />
        </div>
      </section>

      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <form onSubmit={addExpense} className="glass-card p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold text-cream">Log an expense</h3>
          <p className="mb-5 mt-1 text-sm text-beige">Keep a lightweight record of where it went.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              aria-label="Expense amount in rupees"
              className="input-field"
              min="0.01"
              onChange={(event) => setExpenseAmount(event.target.value)}
              placeholder="Amount (₹)"
              required
              step="0.01"
              type="number"
              value={expenseAmount}
            />
            <select
              aria-label="Expense category"
              className="input-field"
              onChange={(event) => setExpenseCategory(event.target.value as ExpenseCategory)}
              value={expenseCategory}
            >
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <input
              className="input-field sm:col-span-2"
              onChange={(event) => setExpenseDescription(event.target.value)}
              placeholder="What was it for?"
              required
              value={expenseDescription}
            />
          </div>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} className="accent-button mt-4 w-full sm:w-auto" type="submit">ADD EXPENSE</motion.button>
        </form>

        <section className="glass-card p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold text-cream">Can I afford this?</h3>
          <p className="mb-5 mt-1 text-sm text-beige">Check a purchase against what remains this month.</p>
          <label htmlFor="afford-amount" className="sr-only">Purchase amount in rupees</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-beige">₹</span>
            <input
              id="afford-amount"
              className="input-field w-full pl-9"
              min="0"
              onChange={(event) => setAffordAmount(event.target.value)}
              placeholder="Enter an amount"
              step="0.01"
              type="number"
              value={affordAmount}
            />
          </div>
          {affordAmount && Number(affordAmount) > 0 && (
            <p aria-live="polite" className={`mt-4 rounded-lg border p-3 text-sm ${remaining - Number(affordAmount) >= 0 ? 'border-green-300/20 bg-green-300/5 text-green-100' : 'border-butter/20 bg-butter/5 text-butter'}`}>
              {remaining - Number(affordAmount) >= 0
                ? `Yes — ${formatMoney(remaining - Number(affordAmount))} would remain afterward.`
                : `That is ${formatMoney(Number(affordAmount) - remaining)} over your remaining budget.`}
            </p>
          )}
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold text-cream">Recent expenses</h3>
              <p className="mt-1 text-sm text-beige">This month, newest first</p>
            </div>
            <span className="rounded-full bg-chocolate/70 px-3 py-1 text-xs text-beige">{monthExpenses.length}</span>
          </div>
          {recentExpenses.length > 0 ? (
            <ul className="divide-y divide-beige/10">
              {recentExpenses.map((expense) => (
                <li key={expense.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-cream">{expense.description}</p>
                    <p className="mt-1 text-xs text-beige">
                      {expense.category} · {new Date(`${expense.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-butter">{formatMoney(expense.amount)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-beige/15 px-4 py-8 text-center text-sm text-beige">
              No expenses yet. Log your first one when you are ready.
            </p>
          )}
        </section>

        <section className="glass-card p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold text-cream">Spending mix</h3>
          <p className="mb-5 mt-1 text-sm text-beige">A quick look by category</p>
          <ul className="space-y-4">
            {categoryTotals.map(({ category, total }) => (
              <li key={category}>
                <div className="mb-1.5 flex justify-between gap-3 text-sm">
                  <span className="text-beige">{category}</span>
                  <span className="text-cream">{formatMoney(total)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-espresso/70">
                  <div
                    className="h-full rounded-full bg-butter/80 transition-[width] duration-500"
                    style={{ width: highestCategory === 0 ? '0%' : `${(total / highestCategory) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default MoneySection;
