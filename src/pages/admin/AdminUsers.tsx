import { useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdminProtected from "@/components/admin/AdminProtected";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import {
  MANAGEABLE_ROLES,
  ROLE_LABELS,
  useAdminUsers,
  useDeleteUser,
  useInviteUser,
  useRevokeUser,
  useSetUserRole,
  type AdminUser,
  type InviteResult,
  type ManageableRole,
} from "@/hooks/admin/useAdminUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatLastSignIn(value: string | null) {
  if (!value) return "Never signed in";
  return `Last signed in ${new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
        No access
      </span>
    );
  }
  const tone =
    role === "developer"
      ? "bg-slate-900 text-white"
      : role === "owner"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-sky-100 text-sky-800";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

type PendingAction =
  | { kind: "revoke"; user: AdminUser }
  | { kind: "delete"; user: AdminUser }
  | null;

function AdminUsersInner() {
  const auth = useAdminAuth();
  const callerId = auth.status === "admin" ? auth.userId : null;

  const { data: users, isLoading, error } = useAdminUsers();
  const invite = useInviteUser();
  const setRole = useSetUserRole();
  const revoke = useRevokeUser();
  const deleteUser = useDeleteUser();

  const [email, setEmail] = useState("");
  const [role, setRoleValue] = useState<ManageableRole>("editor");
  const [handover, setHandover] = useState<
    (InviteResult & { email: string }) | null
  >(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const callerIsDeveloper =
    (users ?? []).find((u) => u.id === callerId)?.isDeveloper ?? false;

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  /**
   * Re-sends the invitation for an account that exists but was never activated.
   * The backend routes this through its re-invite branch, which emails the
   * password link and still returns it for manual handover if sending fails.
   */
  const resendInvite = (user: AdminUser) => {
    const targetRole: ManageableRole =
      user.role === "owner" || user.role === "editor" ? user.role : role;
    setResendingId(user.id);
    invite.mutate(
      { email: user.email, role: targetRole },
      {
        onSuccess: (result) => {
          setResendingId(null);
          if (result.emailSent) {
            toast.success(`Invitation resent to ${user.email}.`);
          } else {
            toast.success(
              `Invitation link generated for ${user.email} — send it manually.`,
            );
          }
          if (result.actionLink || result.password) {
            setHandover({ ...result, email: user.email });
          }
        },
        onError: (err: Error) => {
          setResendingId(null);
          toast.error(err.message);
        },
      },
    );
  };

  const submitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    invite.mutate(
      { email: trimmed, role },
      {
        onSuccess: (result) => {
          setEmail("");
          if (result.reinvited) {
            toast.success(
              "This account already exists — a password reset link was generated.",
            );
          } else if (result.emailSent) {
            toast.success(`Invitation email sent to ${trimmed}.`);
          } else {
            toast.success(`Account created for ${trimmed}.`);
          }
          if (result.actionLink || result.password) {
            setHandover({ ...result, email: trimmed });
          }
        },
        onError: (err: Error) => toast.error(err.message),
      },
    );
  };

  const changeRole = (user: AdminUser, next: ManageableRole) => {
    setRole.mutate(
      { userId: user.id, role: next },
      {
        onSuccess: () => toast.success(`${user.email} is now ${ROLE_LABELS[next]}.`),
        onError: (err: Error) => toast.error(err.message),
      },
    );
  };

  const confirmPending = () => {
    if (!pending) return;
    const { kind, user } = pending;
    setPending(null);
    setDeleteConfirm("");
    if (kind === "revoke") {
      revoke.mutate(
        { userId: user.id },
        {
          onSuccess: () => toast.success(`Access removed for ${user.email}.`),
          onError: (err: Error) => toast.error(err.message),
        },
      );
    } else {
      deleteUser.mutate(
        { userId: user.id },
        {
          onSuccess: () => toast.success(`${user.email} deleted.`),
          onError: (err: Error) => toast.error(err.message),
        },
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500 mt-1">
          Invite teammates and manage who can access the admin.
        </p>
      </header>

      {/* Invite */}
      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-slate-900">Invite a user</h2>
        <form onSubmit={submitInvite} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="invite-email" className="sr-only">Email</Label>
            <Input
              id="invite-email"
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48 space-y-1.5">
            <Label htmlFor="invite-role" className="sr-only">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRoleValue(v as ManageableRole)}
            >
              <SelectTrigger id="invite-role" className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MANAGEABLE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={invite.isPending}>
            {invite.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Send invite
          </Button>
        </form>

        {/* Manual handover fallback */}
        {handover && (
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-amber-900">
                  Hand these details to {handover.email}
                </p>
                <p className="text-amber-800 mt-1">
                  No invitation email could be sent automatically. Share the link
                  {handover.password ? " (or the temporary password)" : ""} privately.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setHandover(null)}>
                Dismiss
              </Button>
            </div>
            {handover.actionLink && (
              <div className="flex items-center gap-2 mt-3">
                <code className="flex-1 truncate rounded-lg bg-white border border-amber-200 px-3 py-2 text-xs text-slate-700">
                  {handover.actionLink}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copy("Link", handover.actionLink!)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
            {handover.password && (
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 truncate rounded-lg bg-white border border-amber-200 px-3 py-2 text-xs text-slate-700">
                  {handover.password}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copy("Password", handover.password!)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Accounts */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Accounts</h2>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}

        {error && (
          <p className="px-6 py-8 text-sm text-red-600">{(error as Error).message}</p>
        )}

        {!isLoading && !error && (
          <ul className="divide-y divide-slate-100">
            {(users ?? []).map((u) => {
              const isSelf = u.id === callerId;
              const readOnly = (u.isDeveloper && !callerIsDeveloper) || isSelf;
              const selfTitle = "You cannot change your own access.";
              return (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center gap-3 px-6 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="truncate font-medium text-slate-900">
                        {u.email}
                      </span>
                      {isSelf && (
                        <Badge variant="outline" className="gap-1">
                          <ShieldCheck className="h-3 w-3" /> You
                        </Badge>
                      )}
                      {u.isDeveloper && (
                        <Badge variant="outline" className="gap-1">
                          <ShieldCheck className="h-3 w-3" /> Developer
                        </Badge>
                      )}
                      {u.isLastOwner && (
                        <Badge variant="outline" className="gap-1">
                          <ShieldCheck className="h-3 w-3" /> Last owner
                        </Badge>
                      )}
                      {!u.confirmed && <Badge variant="outline">Invited</Badge>}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {u.role ? ROLE_LABELS[u.role] ?? u.role : "No access"} ·{" "}
                      {formatLastSignIn(u.lastSignInAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select
                      value={
                        u.role === "owner" || u.role === "editor" ? u.role : undefined
                      }
                      disabled={readOnly || setRole.isPending}
                      onValueChange={(v) => changeRole(u, v as ManageableRole)}
                    >
                      <SelectTrigger
                        className="h-8 w-32"
                        title={
                          isSelf
                            ? selfTitle
                            : u.isDeveloper
                              ? "Managed by the developer"
                              : undefined
                        }
                      >
                        <SelectValue placeholder="Set role" />
                      </SelectTrigger>
                      <SelectContent>
                        {MANAGEABLE_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {!u.confirmed && !isSelf && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={invite.isPending && resendingId === u.id}
                        title="Send the invitation email again"
                        onClick={() => resendInvite(u)}
                      >
                        {invite.isPending && resendingId === u.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Resend invitation"
                        )}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!u.role || readOnly}
                      title={
                        isSelf
                          ? selfTitle
                          : u.isDeveloper
                            ? "Managed by the developer"
                            : u.isLastOwner
                              ? "At least one owner account must remain"
                              : "Remove access"
                      }
                      onClick={() => setPending({ kind: "revoke", user: u })}
                    >
                      Remove access
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={readOnly}
                      title={
                        isSelf
                          ? selfTitle
                          : u.isDeveloper
                            ? "Managed by the developer"
                            : undefined
                      }
                      onClick={() => {
                        setDeleteConfirm("");
                        setPending({ kind: "delete", user: u });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
            {(users ?? []).length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-slate-500">
                No users yet.
              </li>
            )}
          </ul>
        )}
      </section>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.kind === "delete" ? "Delete this account?" : "Remove access?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.kind === "delete"
                ? `${pending?.user.email} will be permanently deleted. This cannot be undone.`
                : `${pending?.user.email} will lose admin access. The account stays, so access can be granted again later.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pending?.kind === "delete" && (
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending?.kind === "delete" && deleteConfirm !== "DELETE"}
              onClick={confirmPending}
              className={
                pending?.kind === "delete"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : undefined
              }
            >
              {pending?.kind === "delete" ? "Delete permanently" : "Remove access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminUsers() {
  return (
    <AdminProtected>
      <AdminUsersInner />
    </AdminProtected>
  );
}
