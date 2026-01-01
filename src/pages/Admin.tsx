import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Shield, Users, Search, Calendar, CheckCircle, XCircle, Clock, ArrowLeft, 
  UserPlus, RefreshCw, Lock, Ban, Trash2, Unlock, MessageSquare, Mail, 
  Send, Download, StickyNote, TrendingUp, DollarSign, BarChart3, Bot, Rocket,
  MailCheck, MailX, RotateCcw, Key, Link, Edit, Bell
} from "lucide-react";
import { format, addMonths, isAfter, isBefore, addDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Admin password is now stored securely in Supabase secrets

interface Profile {
  id: string;
  user_id: string;
  email: string;
  telegram_username: string | null;
  telegram_chat_id: number | null;
  membership_type: "mentorship" | "signals" | null;
  paid_at: string | null;
  paid_until: string | null;
  created_at: string;
  avatar_url: string | null;
  email_notifications: boolean | null;
  telegram_notifications: boolean | null;
  is_blocked: boolean | null;
  blocked_at: string | null;
  admin_notes: string | null;
}

interface PaymentStats {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  totalPayments: number;
  mentorshipCount: number;
  signalsCount: number;
  monthlyData: { month: string; revenue: number }[];
}

interface EASubscription {
  id: string;
  email: string;
  subscribed_at: string;
  verified: boolean;
  verified_at: string | null;
  verification_token: string;
  notified: boolean;
}

interface EAStats {
  total: number;
  verified: number;
  unverified: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  
  // Action states
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [membershipType, setMembershipType] = useState<"mentorship" | "signals">("signals");
  const [customDate, setCustomDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [userToMessage, setUserToMessage] = useState<Profile | null>(null);
  const [messageType, setMessageType] = useState<"telegram" | "email">("telegram");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [userForNotes, setUserForNotes] = useState<Profile | null>(null);
  const [notesText, setNotesText] = useState("");
  
  // General email dialog
  const [generalEmailDialogOpen, setGeneralEmailDialogOpen] = useState(false);
  const [generalEmailTo, setGeneralEmailTo] = useState("");
  const [generalEmailSubject, setGeneralEmailSubject] = useState("");
  const [generalEmailMessage, setGeneralEmailMessage] = useState("");
  
  // EA Launch dialog
  const [eaLaunchDialogOpen, setEaLaunchDialogOpen] = useState(false);
  const [eaLaunchLoading, setEaLaunchLoading] = useState(false);
  
  // Telegram reminder dialog
  const [telegramReminderDialogOpen, setTelegramReminderDialogOpen] = useState(false);
  const [telegramReminderLoading, setTelegramReminderLoading] = useState(false);
  
  // Password reset dialog
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState<Profile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  
  // EA Subscriptions
  const [eaSubscriptions, setEaSubscriptions] = useState<EASubscription[]>([]);
  const [eaStats, setEaStats] = useState<EAStats | null>(null);
  const [eaLoading, setEaLoading] = useState(false);

  // Link Telegram Chat ID dialog
  const [linkChatIdDialogOpen, setLinkChatIdDialogOpen] = useState(false);
  const [linkChatIdUser, setLinkChatIdUser] = useState<Profile | null>(null);
  const [telegramChatIdInput, setTelegramChatIdInput] = useState("");
  const [linkChatIdLoading, setLinkChatIdLoading] = useState(false);

  // Update Telegram Username dialog
  const [updateUsernameDialogOpen, setUpdateUsernameDialogOpen] = useState(false);
  const [updateUsernameUser, setUpdateUsernameUser] = useState<Profile | null>(null);
  const [telegramUsernameInput, setTelegramUsernameInput] = useState("");
  const [updateUsernameLoading, setUpdateUsernameLoading] = useState(false);

  // Edit Paid Until dialog
  const [editPaidUntilDialogOpen, setEditPaidUntilDialogOpen] = useState(false);
  const [editPaidUntilUser, setEditPaidUntilUser] = useState<Profile | null>(null);
  const [editPaidUntilInput, setEditPaidUntilInput] = useState("");
  const [editPaidUntilLoading, setEditPaidUntilLoading] = useState(false);

  // Membership Reminder dialog
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [reminderUser, setReminderUser] = useState<Profile | null>(null);
  const [reminderLoading, setReminderLoading] = useState(false);

  useEffect(() => {
    const adminAuth = sessionStorage.getItem("admin_authenticated");
    const savedPassword = sessionStorage.getItem("admin_password");
    if (adminAuth === "true" && savedPassword) {
      setIsAuthenticated(true);
      setStoredPassword(savedPassword);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && storedPassword) {
      fetchProfiles();
      fetchPaymentStats();
      fetchEaSubscriptions();
    }
  }, [isAuthenticated, storedPassword]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Validate password by making a test API call
      const { data, error } = await supabase.functions.invoke("admin-api", {
        body: { password, action: "get_profiles" }
      });
      
      if (error) {
        toast.error("Pogrešna lozinka");
        return;
      }
      
      setIsAuthenticated(true);
      setStoredPassword(password);
      sessionStorage.setItem("admin_authenticated", "true");
      sessionStorage.setItem("admin_password", password);
      setProfiles(data.profiles || []);
      toast.success("Uspješno ste se prijavili kao admin");
    } catch (error) {
      toast.error("Pogrešna lozinka");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    sessionStorage.removeItem("admin_password");
    setPassword("");
    setStoredPassword("");
  };

  const fetchProfiles = async () => {
    if (!storedPassword) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-api", {
        body: { password: storedPassword, action: "get_profiles" }
      });
      if (error) throw error;
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Greška pri učitavanju korisnika");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    if (!storedPassword) return;
    try {
      const { data, error } = await supabase.functions.invoke("admin-api", {
        body: { password: storedPassword, action: "get_payment_stats" }
      });
      if (error) throw error;
      setPaymentStats(data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchEaSubscriptions = async () => {
    if (!storedPassword) return;
    setEaLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-api", {
        body: { password: storedPassword, action: "get_ea_subscriptions" }
      });
      if (error) throw error;
      setEaSubscriptions(data.subscriptions || []);
      setEaStats(data.stats);
    } catch (error) {
      console.error("Error fetching EA subscriptions:", error);
      toast.error("Greška pri učitavanju EA pretplata");
    } finally {
      setEaLoading(false);
    }
  };

  const handleResendVerification = async (subscription: EASubscription) => {
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { 
          password: storedPassword, 
          action: "resend_ea_verification",
          data: { email: subscription.email, verification_token: subscription.verification_token }
        }
      });
      if (error) throw error;
      toast.success(`Verifikacijski email poslan na ${subscription.email}`);
    } catch (error: any) {
      toast.error(error.message || "Greška pri slanju");
    }
  };

  const handleDeleteEaSubscription = async (subscription: EASubscription) => {
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { 
          password: storedPassword, 
          action: "delete_ea_subscription",
          data: { id: subscription.id }
        }
      });
      if (error) throw error;
      toast.success(`Pretplata ${subscription.email} obrisana`);
      await fetchEaSubscriptions();
    } catch (error: any) {
      toast.error(error.message || "Greška pri brisanju");
    }
  };

  const getMembershipStatus = (profile: Profile) => {
    if (profile.is_blocked) {
      return { status: "blocked", label: "Blokiran", color: "bg-red-700/20 text-red-300" };
    }
    if (!profile.membership_type || !profile.paid_until) {
      return { status: "pending", label: "Čeka", color: "bg-yellow-500/20 text-yellow-400" };
    }
    const now = new Date();
    const paidUntil = new Date(profile.paid_until);
    if (isBefore(paidUntil, now)) {
      return { status: "expired", label: "Isteklo", color: "bg-red-500/20 text-red-400" };
    }
    if (isBefore(paidUntil, addDays(now, 3))) {
      return { status: "expiring", label: "Ističe", color: "bg-orange-500/20 text-orange-400" };
    }
    return { status: "active", label: "Aktivno", color: "bg-green-500/20 text-green-400" };
  };

  const handleActivateMembership = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const paymentDate = customDate ? new Date(customDate) : new Date();
      const validUntil = membershipType === "mentorship" ? addMonths(paymentDate, 3) : addMonths(paymentDate, 1);
      const { error } = await supabase.functions.invoke("admin-api", {
        body: {
          password: storedPassword,
          action: "activate_membership",
          data: {
            user_id: selectedUser.user_id,
            membership_type: membershipType,
            paid_at: paymentDate.toISOString(),
            paid_until: validUntil.toISOString(),
            amount: membershipType === "mentorship" ? 200 : 49
          }
        }
      });
      if (error) throw error;
      toast.success(`Članstvo aktivirano za ${selectedUser.email}`);
      setSelectedUser(null);
      setCustomDate("");
      await fetchProfiles();
      await fetchPaymentStats();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Greška pri aktivaciji");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendMembership = async () => {
    if (!selectedUser || !selectedUser.paid_until) return;
    setActionLoading(true);
    try {
      const currentExpiry = new Date(selectedUser.paid_until);
      const baseDate = customDate ? new Date(customDate) : (isAfter(currentExpiry, new Date()) ? currentExpiry : new Date());
      const type = membershipType || selectedUser.membership_type || "signals";
      const newExpiry = type === "mentorship" ? addMonths(baseDate, 3) : addMonths(baseDate, 1);
      const { error } = await supabase.functions.invoke("admin-api", {
        body: {
          password: storedPassword,
          action: "extend_membership",
          data: {
            user_id: selectedUser.user_id,
            membership_type: type,
            paid_until: newExpiry.toISOString(),
            amount: type === "mentorship" ? 200 : 49
          }
        }
      });
      if (error) throw error;
      toast.success(`Članstvo produženo za ${selectedUser.email}`);
      setSelectedUser(null);
      setCustomDate("");
      await fetchProfiles();
      await fetchPaymentStats();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Greška pri produženju");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async (profile: Profile) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { password: storedPassword, action: "block_user", data: { user_id: profile.user_id } }
      });
      if (error) throw error;
      toast.success(`Korisnik ${profile.email} blokiran`);
      await fetchProfiles();
    } catch (error) {
      toast.error("Greška pri blokiranju");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockUser = async (profile: Profile) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { password: storedPassword, action: "unblock_user", data: { user_id: profile.user_id } }
      });
      if (error) throw error;
      toast.success(`Korisnik ${profile.email} odblokiran`);
      await fetchProfiles();
    } catch (error) {
      toast.error("Greška pri odblokiranju");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: { password: storedPassword, action: "delete_user", data: { user_id: userToDelete.user_id } }
      });
      if (error) throw error;
      toast.success(`Korisnik ${userToDelete.email} obrisan`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      await fetchProfiles();
    } catch (error) {
      toast.error("Greška pri brisanju");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userToMessage || !messageText) return;
    setActionLoading(true);
    try {
      if (messageType === "telegram") {
        if (!userToMessage.telegram_chat_id) {
          toast.error("Korisnik nema povezan Telegram");
          return;
        }
        const { error } = await supabase.functions.invoke("admin-api", {
          body: {
            password: storedPassword,
            action: "send_telegram",
            data: { telegram_chat_id: userToMessage.telegram_chat_id, message: messageText }
          }
        });
        if (error) throw error;
        toast.success("Telegram poruka poslana");
      } else {
        const { error } = await supabase.functions.invoke("admin-api", {
          body: {
            password: storedPassword,
            action: "send_email",
            data: { email: userToMessage.email, subject: messageSubject || "Poruka od EM Capital", message: messageText }
          }
        });
        if (error) throw error;
        toast.success("Email poslan");
      }
      setMessageDialogOpen(false);
      setUserToMessage(null);
      setMessageText("");
      setMessageSubject("");
    } catch (error: any) {
      toast.error(error.message || "Greška pri slanju poruke");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!userForNotes) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: {
          password: storedPassword,
          action: "save_notes",
          data: { user_id: userForNotes.user_id, notes: notesText }
        }
      });
      if (error) throw error;
      toast.success("Bilješke sačuvane");
      setNotesDialogOpen(false);
      setUserForNotes(null);
      await fetchProfiles();
    } catch (error) {
      toast.error("Greška pri čuvanju bilješki");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendGeneralEmail = async () => {
    if (!generalEmailTo || !generalEmailSubject || !generalEmailMessage) {
      toast.error("Popunite sva polja");
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: {
          password: storedPassword,
          action: "send_email",
          data: { 
            email: generalEmailTo, 
            subject: generalEmailSubject, 
            message: generalEmailMessage 
          }
        }
      });
      if (error) throw error;
      toast.success(`Email poslan na ${generalEmailTo}`);
      setGeneralEmailDialogOpen(false);
      setGeneralEmailTo("");
      setGeneralEmailSubject("");
      setGeneralEmailMessage("");
    } catch (error: any) {
      toast.error(error.message || "Greška pri slanju emaila");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEaLaunch = async () => {
    setEaLaunchLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-welcome", {
        body: { type: "ea_launch_broadcast" }
      });
      if (error) throw error;
      
      const results = [];
      if (data.groupSent) results.push("✅ Grupa");
      else results.push("❌ Grupa");
      
      results.push(`👥 ${data.membersSent} članova${data.membersFailed > 0 ? ` (${data.membersFailed} neuspješno)` : ""}`);
      
      if (data.emailsTriggered) results.push("✅ Emailovi");
      else results.push("❌ Emailovi");
      
      toast.success(`EA Lansiranje završeno!\n${results.join("\n")}`);
      setEaLaunchDialogOpen(false);
    } catch (error: any) {
      console.error("EA Launch error:", error);
      toast.error(error.message || "Greška pri lansiranju");
    } finally {
      setEaLaunchLoading(false);
    }
  };

  const handleSendTelegramReminder = async () => {
    setTelegramReminderLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-api", {
        body: { password: storedPassword, action: "send_telegram_reminder_bulk" }
      });
      if (error) throw error;
      
      if (data.sent === 0) {
        toast.info("Nema korisnika bez Telegram Chat ID-a");
      } else {
        toast.success(`Email podsjetnik poslan!\n✅ Uspješno: ${data.sent}\n${data.failed > 0 ? `❌ Neuspješno: ${data.failed}` : ""}`);
      }
      setTelegramReminderDialogOpen(false);
    } catch (error: any) {
      console.error("Telegram reminder error:", error);
      toast.error(error.message || "Greška pri slanju podsjetnika");
    } finally {
      setTelegramReminderLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!passwordResetUser || !newPassword) {
      toast.error("Unesite novu lozinku");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Lozinka mora imati najmanje 8 karaktera");
      return;
    }
    setPasswordResetLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: {
          password: storedPassword,
          action: "reset_user_password",
          data: { 
            user_id: passwordResetUser.user_id, 
            new_password: newPassword,
            email: passwordResetUser.email
          }
        }
      });
      if (error) throw error;
      toast.success(`Lozinka resetovana za ${passwordResetUser.email}`);
      setPasswordResetDialogOpen(false);
      setPasswordResetUser(null);
      setNewPassword("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Greška pri resetovanju lozinke");
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleSendPasswordResetEmail = async (user: Profile) => {
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: {
          password: storedPassword,
          action: "send_password_reset_email",
          data: { email: user.email }
        }
      });
      if (error) throw error;
      toast.success(`Email za reset lozinke poslan na ${user.email}`);
    } catch (error: any) {
      console.error("Password reset email error:", error);
      toast.error(error.message || "Greška pri slanju emaila");
    }
  };

  const handleLinkTelegramChatId = async () => {
    if (!linkChatIdUser || !telegramChatIdInput) {
      toast.error("Unesite Telegram Chat ID");
      return;
    }
    if (!/^\d+$/.test(telegramChatIdInput)) {
      toast.error("Chat ID mora biti broj");
      return;
    }
    setLinkChatIdLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: {
          password: storedPassword,
          action: "link_telegram_chat_id",
          data: { 
            user_id: linkChatIdUser.user_id, 
            telegram_chat_id: telegramChatIdInput
          }
        }
      });
      if (error) throw error;
      toast.success(`Chat ID ${telegramChatIdInput} povezan sa ${linkChatIdUser.email}`);
      setLinkChatIdDialogOpen(false);
      setLinkChatIdUser(null);
      setTelegramChatIdInput("");
      await fetchProfiles();
    } catch (error: any) {
      console.error("Link Chat ID error:", error);
      toast.error(error.message || "Greška pri povezivanju");
    } finally {
      setLinkChatIdLoading(false);
    }
  };

  const handleUpdateTelegramUsername = async () => {
    if (!updateUsernameUser) {
      toast.error("Korisnik nije izabran");
      return;
    }
    setUpdateUsernameLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: {
          password: storedPassword,
          action: "update_telegram_username",
          data: { 
            user_id: updateUsernameUser.user_id, 
            telegram_username: telegramUsernameInput
          }
        }
      });
      if (error) throw error;
      toast.success(`Telegram username ažuriran za ${updateUsernameUser.email}`);
      setUpdateUsernameDialogOpen(false);
      setUpdateUsernameUser(null);
      setTelegramUsernameInput("");
      await fetchProfiles();
    } catch (error: any) {
      console.error("Update username error:", error);
      toast.error(error.message || "Greška pri ažuriranju");
    } finally {
      setUpdateUsernameLoading(false);
    }
  };

  const handleEditPaidUntil = async () => {
    if (!editPaidUntilUser || !editPaidUntilInput) {
      toast.error("Unesite datum");
      return;
    }
    setEditPaidUntilLoading(true);
    try {
      const newPaidUntil = new Date(editPaidUntilInput).toISOString();
      const { error } = await supabase.functions.invoke("admin-api", {
        body: {
          password: storedPassword,
          action: "edit_paid_until",
          data: { 
            user_id: editPaidUntilUser.user_id, 
            paid_until: newPaidUntil
          }
        }
      });
      if (error) throw error;
      toast.success(`Datum članarine ažuriran za ${editPaidUntilUser.email}`);
      setEditPaidUntilDialogOpen(false);
      setEditPaidUntilUser(null);
      setEditPaidUntilInput("");
      await fetchProfiles();
    } catch (error: any) {
      console.error("Edit paid_until error:", error);
      toast.error(error.message || "Greška pri ažuriranju datuma");
    } finally {
      setEditPaidUntilLoading(false);
    }
  };

  const handleSendMembershipReminder = async () => {
    if (!reminderUser) return;
    if (!reminderUser.telegram_chat_id) {
      toast.error("Korisnik nema povezan Telegram");
      return;
    }
    setReminderLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-api", {
        body: {
          password: storedPassword,
          action: "send_membership_reminder",
          data: { 
            user_id: reminderUser.user_id,
            telegram_chat_id: reminderUser.telegram_chat_id,
            telegram_username: reminderUser.telegram_username,
            membership_type: reminderUser.membership_type,
            paid_until: reminderUser.paid_until
          }
        }
      });
      if (error) throw error;
      toast.success(`Podsjetnik poslan korisniku ${reminderUser.email}`);
      setReminderDialogOpen(false);
      setReminderUser(null);
    } catch (error: any) {
      console.error("Reminder error:", error);
      toast.error(error.message || "Greška pri slanju podsjetnika");
    } finally {
      setReminderLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Email", "Telegram", "Tip", "Status", "Plaćeno", "Važi do", "Registrovan", "Bilješke"];
    const rows = profiles.map(p => [
      p.email,
      p.telegram_username || "",
      p.membership_type || "",
      getMembershipStatus(p).label,
      p.paid_at ? format(new Date(p.paid_at), "dd.MM.yyyy") : "",
      p.paid_until ? format(new Date(p.paid_until), "dd.MM.yyyy") : "",
      format(new Date(p.created_at), "dd.MM.yyyy"),
      p.admin_notes || ""
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `korisnici_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("CSV fajl preuzet");
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.telegram_username?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "blocked") return matchesSearch && profile.is_blocked;
    return matchesSearch && getMembershipStatus(profile).status === filterStatus;
  });

  const stats = {
    total: profiles.length,
    active: profiles.filter(p => getMembershipStatus(p).status === "active").length,
    expiring: profiles.filter(p => getMembershipStatus(p).status === "expiring").length,
    expired: profiles.filter(p => getMembershipStatus(p).status === "expired").length,
    pending: profiles.filter(p => getMembershipStatus(p).status === "pending").length,
    blocked: profiles.filter(p => p.is_blocked).length
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Admin Panel</CardTitle>
            <p className="text-sm text-muted-foreground">Unesite admin lozinku</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button className="w-full" onClick={handleLogin}>Prijava</Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Nazad
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dialogs */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrda brisanja</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite obrisati korisnika <strong>{userToDelete?.email}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Otkaži</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={actionLoading}>
              {actionLoading ? "Brisanje..." : "Obriši"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pošalji poruku</DialogTitle>
            <DialogDescription>Korisnik: {userToMessage?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {!userToMessage?.telegram_chat_id && (
              <div className="text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400">
                ⚠️ Korisnik nije pokrenuo Telegram bota - može primiti samo email.
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                variant={messageType === "telegram" ? "default" : "outline"} 
                size="sm"
                onClick={() => setMessageType("telegram")}
                disabled={!userToMessage?.telegram_chat_id}
              >
                <MessageSquare className="h-4 w-4 mr-1" /> Telegram
              </Button>
              <Button 
                variant={messageType === "email" ? "default" : "outline"} 
                size="sm"
                onClick={() => setMessageType("email")}
              >
                <Mail className="h-4 w-4 mr-1" /> Email
              </Button>
            </div>
            {messageType === "email" && (
              <Input 
                placeholder="Naslov emaila" 
                value={messageSubject} 
                onChange={(e) => setMessageSubject(e.target.value)} 
              />
            )}
            <Textarea 
              placeholder="Tekst poruke..." 
              value={messageText} 
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
            />
            <Button className="w-full" onClick={handleSendMessage} disabled={actionLoading || !messageText}>
              <Send className="h-4 w-4 mr-2" />
              {actionLoading ? "Slanje..." : "Pošalji"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bilješke o korisniku</DialogTitle>
            <DialogDescription>{userForNotes?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Textarea 
              placeholder="Unesite bilješke o korisniku..." 
              value={notesText} 
              onChange={(e) => setNotesText(e.target.value)}
              rows={5}
            />
            <Button className="w-full" onClick={handleSaveNotes} disabled={actionLoading}>
              {actionLoading ? "Čuvanje..." : "Sačuvaj bilješke"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* General Email Dialog */}
      <Dialog open={generalEmailDialogOpen} onOpenChange={setGeneralEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pošalji Email</DialogTitle>
            <DialogDescription>Pošaljite email na bilo koju adresu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input 
              type="email"
              placeholder="Email adresa primatelja" 
              value={generalEmailTo} 
              onChange={(e) => setGeneralEmailTo(e.target.value)} 
            />
            <Input 
              placeholder="Naslov emaila" 
              value={generalEmailSubject} 
              onChange={(e) => setGeneralEmailSubject(e.target.value)} 
            />
            <Textarea 
              placeholder="Tekst poruke..." 
              value={generalEmailMessage} 
              onChange={(e) => setGeneralEmailMessage(e.target.value)}
              rows={5}
            />
            <Button 
              className="w-full" 
              onClick={handleSendGeneralEmail} 
              disabled={actionLoading || !generalEmailTo || !generalEmailSubject || !generalEmailMessage}
            >
              <Send className="h-4 w-4 mr-2" />
              {actionLoading ? "Slanje..." : "Pošalji Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EA Launch Dialog */}
      <Dialog open={eaLaunchDialogOpen} onOpenChange={setEaLaunchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              EA Robot Lansiranje
            </DialogTitle>
            <DialogDescription>
              Ova akcija će poslati obavijest o lansiranju EA robota:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Telegram grupa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Svi članovi s Telegram-om</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Email pretplatnicima</span>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-400">
                ⚠️ Ova akcija će poslati poruke svima! Koristite samo kada ste sigurni.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEaLaunchDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleEaLaunch} disabled={eaLaunchLoading}>
              <Rocket className="h-4 w-4 mr-2" />
              {eaLaunchLoading ? "Slanje..." : "Pokreni Lansiranje"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Telegram Reminder Dialog */}
      <Dialog open={telegramReminderDialogOpen} onOpenChange={setTelegramReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-400" />
              Podsjetnik za Telegram povezivanje
            </DialogTitle>
            <DialogDescription>
              Ova akcija će poslati email podsjetnik svim korisnicima koji nemaju Telegram Chat ID.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-sm">Email s uputama za povezivanje @emcapitalforexbot</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm">
                  Bit će poslano na <strong className="text-red-400">{profiles.filter(p => !p.telegram_chat_id).length}</strong> korisnika
                </span>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-400">
                ⚠️ Email će sadržavati upute za pokretanje bota i povezivanje Telegram računa.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTelegramReminderDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSendTelegramReminder} disabled={telegramReminderLoading || profiles.filter(p => !p.telegram_chat_id).length === 0}>
              <Send className="h-4 w-4 mr-2" />
              {telegramReminderLoading ? "Slanje..." : "Pošalji Podsjetnik"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordResetDialogOpen} onOpenChange={setPasswordResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Reset Lozinke
            </DialogTitle>
            <DialogDescription>
              Ručno resetujte lozinku za korisnika {passwordResetUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nova lozinka</label>
              <Input
                type="text"
                placeholder="Unesite novu lozinku (min 8 karaktera)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Lozinka mora imati najmanje 8 karaktera
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-400">
                ⚠️ Korisnik će morati koristiti ovu novu lozinku za prijavu. Preporučujemo da mu pošaljete lozinku putem sigurnog kanala.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setPasswordResetDialogOpen(false); setNewPassword(""); }}>
              Otkaži
            </Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={passwordResetLoading || newPassword.length < 8}
            >
              <Key className="h-4 w-4 mr-2" />
              {passwordResetLoading ? "Resetovanje..." : "Resetuj Lozinku"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Telegram Chat ID Dialog */}
      <Dialog open={linkChatIdDialogOpen} onOpenChange={setLinkChatIdDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-blue-400" />
              Poveži Telegram Chat ID
            </DialogTitle>
            <DialogDescription>
              Ručno povežite Telegram Chat ID za korisnika {linkChatIdUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Telegram Chat ID</label>
              <Input
                type="text"
                placeholder="Unesite Chat ID (npr. 8444910031)"
                value={telegramChatIdInput}
                onChange={(e) => setTelegramChatIdInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Chat ID možete pronaći u bot logovima kada korisnik pošalje poruku botu
              </p>
            </div>
            {linkChatIdUser?.telegram_username && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-400">
                  📱 Telegram username: @{linkChatIdUser.telegram_username}
                </p>
              </div>
            )}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-400">
                ℹ️ Chat ID se može pronaći u logovima edge funkcije telegram-welcome kada korisnik pošalje bilo koju poruku botu.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setLinkChatIdDialogOpen(false); setTelegramChatIdInput(""); }}>
              Otkaži
            </Button>
            <Button 
              onClick={handleLinkTelegramChatId} 
              disabled={linkChatIdLoading || !telegramChatIdInput}
            >
              <Link className="h-4 w-4 mr-2" />
              {linkChatIdLoading ? "Povezivanje..." : "Poveži"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Telegram Username Dialog */}
      <Dialog open={updateUsernameDialogOpen} onOpenChange={setUpdateUsernameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-400" />
              Ažuriraj Telegram Username
            </DialogTitle>
            <DialogDescription>
              Ručno ažurirajte Telegram username za korisnika {updateUsernameUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Telegram Username</label>
              <Input
                type="text"
                placeholder="Unesite username (npr. mirel_fx)"
                value={telegramUsernameInput}
                onChange={(e) => setTelegramUsernameInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Unesite username bez @ simbola. Ostavite prazno za brisanje.
              </p>
            </div>
            {updateUsernameUser?.telegram_username && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-400">
                  📱 Trenutni username: @{updateUsernameUser.telegram_username}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setUpdateUsernameDialogOpen(false); setTelegramUsernameInput(""); }}>
              Otkaži
            </Button>
            <Button 
              onClick={handleUpdateTelegramUsername} 
              disabled={updateUsernameLoading}
            >
              <Edit className="h-4 w-4 mr-2" />
              {updateUsernameLoading ? "Ažuriranje..." : "Ažuriraj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Paid Until Dialog */}
      <Dialog open={editPaidUntilDialogOpen} onOpenChange={setEditPaidUntilDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Uredi datum članarine
            </DialogTitle>
            <DialogDescription>
              Ručno promijenite datum isteka članarine za korisnika {editPaidUntilUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Novi datum isteka</label>
              <Input
                type="date"
                value={editPaidUntilInput}
                onChange={(e) => setEditPaidUntilInput(e.target.value)}
              />
            </div>
            {editPaidUntilUser?.paid_until && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                <p className="text-sm text-primary">
                  📅 Trenutni datum: {format(new Date(editPaidUntilUser.paid_until), "dd.MM.yyyy")}
                </p>
              </div>
            )}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-400">
                ⚠️ Ova promjena ne kreira novi zapis u historiji plaćanja.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setEditPaidUntilDialogOpen(false); setEditPaidUntilInput(""); }}>
              Otkaži
            </Button>
            <Button 
              onClick={handleEditPaidUntil} 
              disabled={editPaidUntilLoading || !editPaidUntilInput}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {editPaidUntilLoading ? "Spremanje..." : "Spremi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Membership Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Pošalji podsjetnik za članarinu
            </DialogTitle>
            <DialogDescription>
              Pošalji Telegram podsjetnik korisniku {reminderUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {reminderUser?.telegram_chat_id ? (
              <>
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Pregled poruke:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>🤖 <strong>Automatska obavijest</strong></p>
                    <p>👋 Pozdrav @{reminderUser.telegram_username || 'člane'}, tvoja {reminderUser.membership_type === 'mentorship' ? 'Mentorship' : 'Premium Signali'} pretplata uskoro ističe.</p>
                    <p>📊 Status članarine: {reminderUser.paid_until && new Date(reminderUser.paid_until) > new Date() ? '🟢 Aktivna' : '🔴 Istekla'}</p>
                    <p>📅 Važi do: {reminderUser.paid_until ? format(new Date(reminderUser.paid_until), "dd.MM.yyyy") : '-'}</p>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <p className="text-sm text-green-400">
                    ✓ Korisnik ima povezan Telegram i može primiti poruku
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400">
                  ❌ Korisnik nema povezan Telegram - ne može primiti poruku
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>
              Otkaži
            </Button>
            <Button 
              onClick={handleSendMembershipReminder} 
              disabled={reminderLoading || !reminderUser?.telegram_chat_id}
            >
              <Bell className="h-4 w-4 mr-2" />
              {reminderLoading ? "Slanje..." : "Pošalji podsjetnik"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="default" size="sm" onClick={() => setEaLaunchDialogOpen(true)}>
              <Rocket className="h-4 w-4 mr-2" /> EA Lansiranje
            </Button>
            <Button variant="outline" size="sm" onClick={() => setGeneralEmailDialogOpen(true)}>
              <Mail className="h-4 w-4 mr-2" /> Email
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => { fetchProfiles(); fetchPaymentStats(); fetchEaSubscriptions(); }}>
              <RefreshCw className="h-4 w-4 mr-2" /> Osvježi
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Odjava</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Učitavanje...</p>
          </div>
        ) : (
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" /> Korisnici</TabsTrigger>
              <TabsTrigger value="ea-subscriptions"><Rocket className="h-4 w-4 mr-2" /> EA Pretplate</TabsTrigger>
              <TabsTrigger value="telegram"><Bot className="h-4 w-4 mr-2" /> Telegram</TabsTrigger>
              <TabsTrigger value="stats"><BarChart3 className="h-4 w-4 mr-2" /> Statistika</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-6">
              {/* Revenue Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/10 border-primary/30">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-primary">{paymentStats?.totalRevenue || 0}€</p>
                    <p className="text-xs text-muted-foreground">Ukupni prihod</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-400" />
                    <p className="text-2xl font-bold text-green-400">{paymentStats?.thisMonthRevenue || 0}€</p>
                    <p className="text-xs text-muted-foreground">Ovaj mjesec</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/30">
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                    <p className="text-2xl font-bold text-blue-400">{paymentStats?.lastMonthRevenue || 0}€</p>
                    <p className="text-xs text-muted-foreground">Prošli mjesec</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-500/10 border-purple-500/30">
                  <CardContent className="p-4 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                    <p className="text-2xl font-bold text-purple-400">{paymentStats?.totalPayments || 0}</p>
                    <p className="text-xs text-muted-foreground">Ukupno plaćanja</p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Mjesečni prihod</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentStats?.monthlyData || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="month" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                          formatter={(value) => [`${value}€`, 'Prihod']}
                        />
                        <Bar dataKey="revenue" fill="#d4af37" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Membership breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{paymentStats?.mentorshipCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Mentorship plaćanja</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-blue-400">{paymentStats?.signalsCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Signals plaćanja</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ea-subscriptions" className="space-y-6">
              {/* EA Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/10 border-primary/30">
                  <CardContent className="p-4 text-center">
                    <Rocket className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-primary">{eaStats?.total || 0}</p>
                    <p className="text-xs text-muted-foreground">Ukupno pretplata</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <MailCheck className="h-6 w-6 mx-auto mb-2 text-green-400" />
                    <p className="text-2xl font-bold text-green-400">{eaStats?.verified || 0}</p>
                    <p className="text-xs text-muted-foreground">Verificirano</p>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-500/10 border-yellow-500/30">
                  <CardContent className="p-4 text-center">
                    <MailX className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                    <p className="text-2xl font-bold text-yellow-400">{eaStats?.unverified || 0}</p>
                    <p className="text-xs text-muted-foreground">Čeka verifikaciju</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/30">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                    <p className="text-2xl font-bold text-blue-400">
                      {eaStats?.total ? Math.round((eaStats.verified / eaStats.total) * 100) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Stopa verifikacije</p>
                  </CardContent>
                </Card>
              </div>

              {/* Verified Subscriptions */}
              <Card className="border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <MailCheck className="h-5 w-5" /> Verificirane pretplate ({eaStats?.verified || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eaLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Pretplaćen</TableHead>
                          <TableHead>Verificiran</TableHead>
                          <TableHead>Akcije</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eaSubscriptions.filter(s => s.verified).map(sub => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium">{sub.email}</TableCell>
                            <TableCell>{format(new Date(sub.subscribed_at), "dd.MM.yyyy HH:mm")}</TableCell>
                            <TableCell>
                              {sub.verified_at && format(new Date(sub.verified_at), "dd.MM.yyyy HH:mm")}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDeleteEaSubscription(sub)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {eaSubscriptions.filter(s => s.verified).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              Nema verificiranih pretplata
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Unverified Subscriptions */}
              <Card className="border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <MailX className="h-5 w-5" /> Neverificirane pretplate ({eaStats?.unverified || 0})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Ovi korisnici nisu potvrdili svoju email adresu
                  </p>
                </CardHeader>
                <CardContent>
                  {eaLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Pretplaćen</TableHead>
                          <TableHead>Akcije</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eaSubscriptions.filter(s => !s.verified).map(sub => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium">{sub.email}</TableCell>
                            <TableCell>{format(new Date(sub.subscribed_at), "dd.MM.yyyy HH:mm")}</TableCell>
                            <TableCell className="space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleResendVerification(sub)}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" /> Pošalji ponovo
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDeleteEaSubscription(sub)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {eaSubscriptions.filter(s => !s.verified).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              Sve pretplate su verificirane!
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="telegram" className="space-y-6">
              {/* Telegram Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-400" />
                    <p className="text-2xl font-bold text-green-400">
                      {profiles.filter(p => p.telegram_chat_id).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Sa Chat ID</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardContent className="p-4 text-center">
                    <XCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
                    <p className="text-2xl font-bold text-red-400">
                      {profiles.filter(p => !p.telegram_chat_id).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Bez Chat ID</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/30">
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                    <p className="text-2xl font-bold text-blue-400">
                      {profiles.filter(p => p.telegram_username).length}
                    </p>
                    <p className="text-xs text-muted-foreground">S korisničkim imenom</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/30">
                  <CardContent className="p-4 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-primary">
                      {Math.round((profiles.filter(p => p.telegram_chat_id).length / profiles.length) * 100) || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Povezano</p>
                  </CardContent>
                </Card>
              </div>

              {/* Send Reminder Button */}
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Pošalji email podsjetnik</p>
                      <p className="text-sm text-muted-foreground">
                        Pošalji upute za povezivanje bota korisnicima bez Chat ID-a
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setTelegramReminderDialogOpen(true)}
                    disabled={profiles.filter(p => !p.telegram_chat_id).length === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Pošalji ({profiles.filter(p => !p.telegram_chat_id).length})
                  </Button>
                </CardContent>
              </Card>

              {/* Users without Chat ID */}
              <Card className="border-red-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <XCircle className="h-5 w-5" /> Korisnici BEZ Telegram Chat ID ({profiles.filter(p => !p.telegram_chat_id).length})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Ovi korisnici nisu pokrenuli bota @emcapitalforexbot - ne mogu primati Telegram notifikacije
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Telegram Username</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Registrovan</TableHead>
                          <TableHead>Akcije</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.filter(p => !p.telegram_chat_id).map((profile) => {
                          const status = getMembershipStatus(profile);
                          return (
                            <TableRow key={profile.id}>
                              <TableCell className="font-medium">{profile.email}</TableCell>
                              <TableCell>
                                {profile.telegram_username ? (
                                  <span className="text-blue-400">@{profile.telegram_username}</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={status.color}>{status.label}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(profile.created_at), "dd.MM.yyyy")}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setLinkChatIdUser(profile);
                                      setTelegramChatIdInput("");
                                      setLinkChatIdDialogOpen(true);
                                    }}
                                    title="Poveži Chat ID"
                                  >
                                    <Link className="h-4 w-4 mr-1" />
                                    Poveži
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setUpdateUsernameUser(profile);
                                      setTelegramUsernameInput(profile.telegram_username || "");
                                      setUpdateUsernameDialogOpen(true);
                                    }}
                                    title="Uredi username"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Users with Chat ID */}
              <Card className="border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-5 w-5" /> Korisnici SA Telegram Chat ID ({profiles.filter(p => p.telegram_chat_id).length})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Ovi korisnici mogu primati Telegram notifikacije
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Telegram Username</TableHead>
                          <TableHead>Chat ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Akcije</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.filter(p => p.telegram_chat_id).map((profile) => {
                          const status = getMembershipStatus(profile);
                          return (
                            <TableRow key={profile.id}>
                              <TableCell className="font-medium">{profile.email}</TableCell>
                              <TableCell>
                                {profile.telegram_username ? (
                                  <span className="text-blue-400">@{profile.telegram_username}</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-green-400 font-mono text-sm">
                                {profile.telegram_chat_id}
                              </TableCell>
                              <TableCell>
                                <Badge className={status.color}>{status.label}</Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUpdateUsernameUser(profile);
                                    setTelegramUsernameInput(profile.telegram_username || "");
                                    setUpdateUsernameDialogOpen(true);
                                  }}
                                  title="Uredi username"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <Card className="bg-card/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Ukupno</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-green-400">{stats.active}</p>
                    <p className="text-xs text-muted-foreground">Aktivno</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-500/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-orange-400">{stats.expiring}</p>
                    <p className="text-xs text-muted-foreground">Ističe</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-red-400">{stats.expired}</p>
                    <p className="text-xs text-muted-foreground">Isteklo</p>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-500/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-yellow-400">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">Čeka</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-700/10">
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-red-300">{stats.blocked}</p>
                    <p className="text-xs text-muted-foreground">Blokirano</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pretraži..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full md:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Svi</SelectItem>
                        <SelectItem value="active">Aktivno</SelectItem>
                        <SelectItem value="expiring">Ističe</SelectItem>
                        <SelectItem value="expired">Isteklo</SelectItem>
                        <SelectItem value="pending">Čeka</SelectItem>
                        <SelectItem value="blocked">Blokirani</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" /> Korisnici ({filteredProfiles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Telegram</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Važi do</TableHead>
                          <TableHead className="text-right">Akcije</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProfiles.map((profile) => {
                          const status = getMembershipStatus(profile);
                          return (
                            <TableRow key={profile.id} className={profile.is_blocked ? "opacity-60" : ""}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{profile.email}</p>
                                  {profile.admin_notes && (
                                    <p className="text-xs text-muted-foreground truncate max-w-48" title={profile.admin_notes}>
                                      📝 {profile.admin_notes}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {profile.telegram_username ? (
                                  <div className="flex items-center gap-1">
                                    <a href={`https://t.me/${profile.telegram_username.replace('@', '')}`} target="_blank" className="text-primary hover:underline text-sm">
                                      {profile.telegram_username}
                                    </a>
                                    {profile.telegram_chat_id ? (
                                      <span title="Može primati Telegram poruke" className="text-green-500">✓</span>
                                    ) : (
                                      <span title="Nije pokrenuo bota - ne može primati poruke" className="text-yellow-500">⚠</span>
                                    )}
                                  </div>
                                ) : "-"}
                              </TableCell>
                              <TableCell>
                                <Badge className={status.color}>{status.label}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span>{profile.paid_until ? format(new Date(profile.paid_until), "dd.MM.yy") : "-"}</span>
                                  {profile.paid_until && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      title="Uredi datum"
                                      onClick={() => {
                                        setEditPaidUntilUser(profile);
                                        setEditPaidUntilInput(profile.paid_until ? format(new Date(profile.paid_until), "yyyy-MM-dd") : "");
                                        setEditPaidUntilDialogOpen(true);
                                      }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1 flex-wrap">
                                  {/* Activate/Extend */}
                                  {!profile.is_blocked && (
                                    !profile.membership_type || !profile.paid_until ? (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button size="sm" variant="default" onClick={() => setSelectedUser(profile)} title="Aktiviraj">
                                            <UserPlus className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader><DialogTitle>Aktiviraj članstvo</DialogTitle></DialogHeader>
                                          <div className="space-y-4 pt-4">
                                            <p className="text-sm">Korisnik: <strong>{profile.email}</strong></p>
                                            <Select value={membershipType} onValueChange={(v) => setMembershipType(v as any)}>
                                              <SelectTrigger><SelectValue /></SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="signals">Signals (49€/mj)</SelectItem>
                                                <SelectItem value="mentorship">Mentorship (200€/3mj)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
                                            <Button className="w-full" onClick={handleActivateMembership} disabled={actionLoading}>
                                              {actionLoading ? "..." : "Aktiviraj"}
                                            </Button>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    ) : (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button size="sm" variant="outline" onClick={() => { setSelectedUser(profile); setMembershipType(profile.membership_type || "signals"); }} title="Produži">
                                            <RefreshCw className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader><DialogTitle>Produži članstvo</DialogTitle></DialogHeader>
                                          <div className="space-y-4 pt-4">
                                            <p className="text-sm">Korisnik: <strong>{profile.email}</strong></p>
                                            <p className="text-sm">Važi do: <strong>{profile.paid_until ? format(new Date(profile.paid_until), "dd.MM.yyyy") : "-"}</strong></p>
                                            <Select value={membershipType} onValueChange={(v) => setMembershipType(v as any)}>
                                              <SelectTrigger><SelectValue /></SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="signals">Signals (+1mj)</SelectItem>
                                                <SelectItem value="mentorship">Mentorship (+3mj)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <Button className="w-full" onClick={handleExtendMembership} disabled={actionLoading}>
                                              {actionLoading ? "..." : "Produži"}
                                            </Button>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    )
                                  )}

                                  {/* Reminder */}
                                  {profile.paid_until && profile.telegram_chat_id && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="text-primary"
                                      title="Pošalji podsjetnik za članarinu" 
                                      onClick={() => {
                                        setReminderUser(profile);
                                        setReminderDialogOpen(true);
                                      }}
                                    >
                                      <Bell className="h-4 w-4" />
                                    </Button>
                                  )}

                                  {/* Message */}
                                  <Button size="sm" variant="outline" title="Pošalji poruku" onClick={() => {
                                    setUserToMessage(profile);
                                    setMessageType(profile.telegram_chat_id ? "telegram" : "email");
                                    setMessageDialogOpen(true);
                                  }}>
                                    <Send className="h-4 w-4" />
                                  </Button>

                                  {/* Notes */}
                                  <Button size="sm" variant="outline" title="Bilješke" onClick={() => {
                                    setUserForNotes(profile);
                                    setNotesText(profile.admin_notes || "");
                                    setNotesDialogOpen(true);
                                  }}>
                                    <StickyNote className="h-4 w-4" />
                                  </Button>

                                  {/* Password Reset */}
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-primary"
                                    title="Reset Lozinke" 
                                    onClick={() => {
                                      setPasswordResetUser(profile);
                                      setNewPassword("");
                                      setPasswordResetDialogOpen(true);
                                    }}
                                  >
                                    <Key className="h-4 w-4" />
                                  </Button>

                                  {/* Block/Unblock */}
                                  {profile.is_blocked ? (
                                    <Button size="sm" variant="outline" onClick={() => handleUnblockUser(profile)} title="Odblokiraj">
                                      <Unlock className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" className="text-orange-500" onClick={() => handleBlockUser(profile)} title="Blokiraj">
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  )}

                                  {/* Delete */}
                                  <Button size="sm" variant="outline" className="text-red-500" title="Obriši" onClick={() => {
                                    setUserToDelete(profile);
                                    setDeleteDialogOpen(true);
                                  }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredProfiles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">Nema korisnika</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Admin;