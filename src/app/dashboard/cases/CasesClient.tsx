"use client";

import { useState } from "react";
import { updateComplaintCase, assignComplaintCase } from "./actions";
import styles from "./cases.module.css";

const CATEGORIES = [
  "screen_unlock",
  "reset_forgotten_password",
  "account_lock",
  "system_software_repair",
];

const CASE_STATUSES = [
  "new",
  "in_review",
  "in_progress",
  "awaiting_customer",
  "completed",
  "declined",
];

function categoryLabel(cat: string) {
  return cat.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function statusLabel(status: string) {
  return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function dateTime(d: Date | string) {
  return new Date(d).toLocaleDateString("id-ID", { dateStyle: "medium" });
}

export default function CasesClient({ 
  cases, 
  assignees, 
  isAdmin, 
  currentUserId 
}: { 
  cases: any[], 
  assignees: any[], 
  isAdmin: boolean,
  currentUserId: string
}) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdate = async (caseId: string, data: any) => {
    setIsUpdating(caseId);
    const res = await updateComplaintCase({ caseId, ...data });
    if (!res.success) alert("Failed to update case: " + res.error);
    setIsUpdating(null);
  };

  const handleAssign = async (caseId: string, assignedToUserId: string) => {
    setIsUpdating(caseId);
    const res = await assignComplaintCase({ caseId, assignedToUserId });
    if (!res.success) alert("Failed to assign case: " + res.error);
    setIsUpdating(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Case Operations</span>
        <h1 className={styles.title}>Every complaint, traceable.</h1>
        <p className={styles.description}>Browse records assigned to you, unless you are an administrator. Changes to status, classification, and notes are recorded.</p>
      </header>

      <div className={styles.casesList}>
        {cases.length === 0 && (
          <div className={styles.emptyState}>
            <p>No assigned cases yet</p>
            <span>Create an intake record to begin the operational workflow.</span>
          </div>
        )}

        {cases.map(item => (
          <article key={item.id} className={styles.caseCard}>
            <div className={styles.caseHeader}>
              <div>
                <p className={styles.caseRef}>{item.caseReference}</p>
                <h2 className={styles.caseTitle}>{item.deviceBrand} {item.deviceModel}</h2>
                <p className={styles.caseMeta}>
                  Created {dateTime(item.createdAt)} &middot; Data-loss consent: 
                  <strong> {item.dataLossConsent ? "Recorded" : "Not recorded"}</strong>
                </p>
              </div>
              <div className={styles.statusPill}>{statusLabel(item.status)}</div>
            </div>

            <div className={styles.caseGrid}>
              <label className={styles.label}>Classification
                <select 
                  defaultValue={item.classification} 
                  onChange={e => handleUpdate(item.id, { classification: e.target.value })} 
                  className={styles.select}
                  disabled={isUpdating === item.id}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{categoryLabel(cat)}</option>)}
                </select>
              </label>
              
              <label className={styles.label}>Processing status
                <select 
                  defaultValue={item.status} 
                  onChange={e => handleUpdate(item.id, { status: e.target.value })} 
                  className={styles.select}
                  disabled={isUpdating === item.id}
                >
                  {CASE_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </label>

              <div>
                <p className={styles.label}>Recommended SOP</p>
                <p className={styles.recommendedText}>{categoryLabel(item.recommendedCategory)}</p>
              </div>

              <label className={styles.label}>Assigned staff
                {isAdmin ? (
                  <select 
                    defaultValue={item.assignedToUserId ?? ""} 
                    onChange={e => handleAssign(item.id, e.target.value)} 
                    className={styles.select}
                    disabled={isUpdating === item.id}
                  >
                    <option value="" disabled>Select staff</option>
                    {assignees.map(person => (
                      <option key={person.id} value={person.id}>{person.name || person.email || `User ${person.id}`}</option>
                    ))}
                  </select>
                ) : (
                  <p className={styles.assignedText}>{item.assignedToUserId === currentUserId ? "You" : `Staff #${item.assignedToUserId ?? "—"}`}</p>
                )}
              </label>
            </div>

            <label className={styles.notesLabel}>Operational notes
              <textarea 
                defaultValue={item.notes ?? ""} 
                onBlur={e => { 
                  if (e.target.value !== (item.notes ?? "")) {
                    handleUpdate(item.id, { notes: e.target.value || undefined });
                  }
                }} 
                className={styles.textarea} 
                placeholder="Add or revise internal operational notes"
                disabled={isUpdating === item.id}
              />
            </label>
          </article>
        ))}
      </div>
    </div>
  );
}
