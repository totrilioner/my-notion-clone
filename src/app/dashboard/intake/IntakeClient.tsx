"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createComplaintCase } from "./actions";
import styles from "./intake.module.css";

function IconLoader() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={styles.spin}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"/></svg>; }
function IconClipboardPlus() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>; }

const categoryMeta: Record<string, { label: string, color: string, description: string }> = {
  screen_unlock: { label: "Screen Unlock", color: "#e0f2fe", description: "Standard process for removing PIN, pattern, or password." },
  reset_forgotten_password: { label: "Reset Password", color: "#fef08a", description: "Process for devices that have been factory reset but are locked." },
  account_lock: { label: "Account Lock", color: "#ffedd5", description: "FRP (Google) or iCloud activation lock removal." },
  system_software_repair: { label: "System Repair", color: "#dcfce7", description: "Flashing or software repair for bootloop, stuck logo, or system errors." },
};

export default function IntakeClient() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    customerName: "", customerContact: "", deviceBrand: "", deviceModel: "", 
    deviceCondition: "", cannotAccess: "", resetHistory: "", 
    accountPrompt: "", systemSymptoms: "", dataLossConsent: false, notes: "" 
  });
  const [isPending, setIsPending] = useState(false);

  // Compute recommendation reactively
  let recommendedCategory = "screen_unlock";
  if (form.systemSymptoms) recommendedCategory = "system_software_repair";
  else if (form.accountPrompt) recommendedCategory = "account_lock";
  else if (form.resetHistory) recommendedCategory = "reset_forgotten_password";

  const meta = categoryMeta[recommendedCategory];

  const update = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    
    const answers = {
      cannotAccess: form.cannotAccess,
      resetHistory: form.resetHistory,
      accountPrompt: form.accountPrompt,
      systemSymptoms: form.systemSymptoms,
    };
    
    const res = await createComplaintCase({
      ...form,
      customerAnswers: answers
    });
    
    setIsPending(false);
    
    if (res.success) {
      alert(`Case ${res.caseReference} created successfully.`);
      router.push("/dashboard/cases");
    } else {
      alert("Failed to create case: " + res.error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Guided Intake</span>
        <h1 className={styles.title}>Capture once. Classify consistently.</h1>
        <p className={styles.description}>The guided record stores device condition, customer answers, consent, and a recommended SOP path.</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.grid}>
        <div className={styles.formPanel}>
          <div className={styles.fieldGrid}>
            <label className={styles.label}>Customer name
              <input value={form.customerName} onChange={e => update("customerName", e.target.value)} className={styles.input} />
            </label>
            <label className={styles.label}>Customer contact
              <input value={form.customerContact} onChange={e => update("customerContact", e.target.value)} className={styles.input} />
            </label>
            <label className={styles.label}>Device brand <span className={styles.req}>*</span>
              <input required value={form.deviceBrand} onChange={e => update("deviceBrand", e.target.value)} className={styles.input} placeholder="e.g. Apple, Samsung" />
            </label>
            <label className={styles.label}>Device model <span className={styles.req}>*</span>
              <input required value={form.deviceModel} onChange={e => update("deviceModel", e.target.value)} className={styles.input} placeholder="e.g. iPhone 13" />
            </label>
          </div>
          
          <label className={styles.label}>Device condition <span className={styles.req}>*</span>
            <textarea required value={form.deviceCondition} onChange={e => update("deviceCondition", e.target.value)} className={styles.textarea} placeholder="Describe visible condition, power state, screen, and any physical symptoms." />
          </label>

          <div className={styles.divider}>
            <label className={styles.label}>What blocks device access?
              <span className={styles.hint}>For example: pattern, PIN, password, or cannot enter the home screen.</span>
              <textarea value={form.cannotAccess} onChange={e => update("cannotAccess", e.target.value)} className={styles.textareaSmall} />
            </label>
            <label className={styles.label}>Has the device been reset?
              <span className={styles.hint}>Record whether a reset was attempted or data was already erased.</span>
              <textarea value={form.resetHistory} onChange={e => update("resetHistory", e.target.value)} className={styles.textareaSmall} />
            </label>
            <label className={styles.label}>Is a Google or Apple account requested?
              <span className={styles.hint}>Record any activation screen or previous-account prompt.</span>
              <textarea value={form.accountPrompt} onChange={e => update("accountPrompt", e.target.value)} className={styles.textareaSmall} />
            </label>
            <label className={styles.label}>Are there system symptoms?
              <span className={styles.hint}>For example: bootloop, logo stuck, restart, update failure, or error.</span>
              <textarea value={form.systemSymptoms} onChange={e => update("systemSymptoms", e.target.value)} className={styles.textareaSmall} />
            </label>
          </div>

          <label className={styles.label}>Internal notes
            <textarea value={form.notes} onChange={e => update("notes", e.target.value)} className={styles.textareaSmall} placeholder="Optional operational notes" />
          </label>

          <label className={styles.checkboxContainer}>
            <input required type="checkbox" checked={form.dataLossConsent} onChange={e => update("dataLossConsent", e.target.checked)} className={styles.checkbox} />
            <div>
              <strong>Data-loss consent recorded.</strong><br/>
              <span>The customer understands that recovery, reset, or software work may affect device data.</span>
            </div>
          </label>

          <button type="submit" disabled={isPending} className={styles.submitBtn}>
            {isPending ? <IconLoader /> : <IconClipboardPlus />} Create complaint case
          </button>
        </div>

        <aside className={styles.sidebar}>
          <p className={styles.eyebrow}>Recommendation</p>
          <div className={styles.iconBox} style={{ backgroundColor: meta.color }} />
          <h2 className={styles.sidebarTitle}>{meta.label}</h2>
          <p className={styles.sidebarDesc}>{meta.description}</p>
          
          <div className={styles.infoBox}>
            <strong>Classification aid, not a bypass.</strong><br/>
            The record should support staff decisions and preserve required ownership verification, customer consent, and refusal conditions.
          </div>
        </aside>
      </form>
    </div>
  );
}
