import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import { Settings as SettingsIcon, Bell, Mail, MessageSquare, Loader2, Save } from "lucide-react";
import { motion } from "motion/react";

export default function Settings() {
  const { user, loading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [preferences, setPreferences] = useState({
    email: true,
    sms: true,
  });
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.notificationPreferences) {
            setPreferences({
              email: data.notificationPreferences.email ?? true,
              sms: data.notificationPreferences.sms ?? true,
            });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage({ type: "", text: "" });

    try {
      await updateDoc(doc(db, "users", user.uid), {
        notificationPreferences: preferences
      });
      setSaveMessage({ type: "success", text: "Preferences saved successfully." });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      setSaveMessage({ type: "error", text: "Failed to save preferences." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 bg-slate-50">
        <div className="bg-white max-w-md w-full rounded-3xl p-10 text-center border border-slate-200 shadow-xl">
          <SettingsIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in Required</h2>
          <p className="text-slate-600">Please sign in to manage your settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-600">Manage your account preferences and notifications.</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
        >
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <Bell className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
            </div>
            
            <p className="text-slate-600 mb-8">
              Choose how you want to receive updates about your loan applications and repayment reminders.
            </p>

            <div className="space-y-6">
              {/* Email Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive updates via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={preferences.email}
                    onChange={(e) => setPreferences({ ...preferences, email: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* SMS Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">SMS Notifications</p>
                    <p className="text-sm text-slate-500">Receive text messages on your mobile</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={preferences.sms}
                    onChange={(e) => setPreferences({ ...preferences, sms: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                {saveMessage.text && (
                  <span className={`text-sm font-medium ${saveMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {saveMessage.text}
                  </span>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Preferences
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
