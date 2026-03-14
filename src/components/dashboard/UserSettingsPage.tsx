import { Show, createMemo, createResource, createSignal } from "solid-js";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { useToast } from "../feedback/ToastProvider";
import {
  changeCurrentUserPassword,
  getCurrentUserSettings,
  startGitHubSignIn,
  updateCurrentUserProfile,
  type CurrentUserSettings,
} from "../../auth/client";
import { t } from "../../i18n";
import type { AuthUser } from "../../types/auth";

type UserSettingsPageProps = {
  currentUser: AuthUser;
  onUserUpdated: (user: AuthUser) => void;
  onBackToDashboard: () => void;
};

export function UserSettingsPage(props: UserSettingsPageProps) {
  const { pushToast } = useToast();
  const [settings, { refetch }] = createResource<CurrentUserSettings>(async () => getCurrentUserSettings());

  const [fullName, setFullName] = createSignal(props.currentUser.fullName);
  const [isSavingName, setIsSavingName] = createSignal(false);
  const [nameSubmitted, setNameSubmitted] = createSignal(false);

  const [currentPassword, setCurrentPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [passwordSubmitted, setPasswordSubmitted] = createSignal(false);
  const [isChangingPassword, setIsChangingPassword] = createSignal(false);

  const nameError = createMemo(() => {
    if (!nameSubmitted()) {
      return "";
    }

    return fullName().trim().length >= 2 ? "" : t.settings.user.fullNameError;
  });

  const currentPasswordError = createMemo(() => {
    if (!passwordSubmitted()) {
      return "";
    }

    return currentPassword().length > 0 ? "" : t.settings.user.currentPasswordError;
  });

  const newPasswordError = createMemo(() => {
    if (!passwordSubmitted()) {
      return "";
    }

    return newPassword().length >= 8 ? "" : "Password must be at least 8 characters.";
  });

  const confirmPasswordError = createMemo(() => {
    if (!passwordSubmitted()) {
      return "";
    }

    return newPassword() === confirmPassword() ? "" : t.settings.user.passwordMismatchError;
  });

  const handleSaveName = async (event: SubmitEvent) => {
    event.preventDefault();
    setNameSubmitted(true);

    if (nameError()) {
      pushToast({
        type: "error",
        title: t.settings.user.profileErrorTitle,
        description: nameError(),
      });
      return;
    }

    setIsSavingName(true);

    try {
      const user = await updateCurrentUserProfile({ fullName: fullName() });
      props.onUserUpdated(user);
      pushToast({
        type: "success",
        title: t.settings.user.profileUpdatedTitle,
        description: t.settings.user.profileUpdatedDescription,
      });
      await refetch();
    } catch (error) {
      pushToast({
        type: "error",
        title: t.settings.user.profileErrorTitle,
        description: error instanceof Error ? error.message : "Unable to update your profile right now.",
      });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (event: SubmitEvent) => {
    event.preventDefault();
    setPasswordSubmitted(true);

    if (currentPasswordError() || newPasswordError() || confirmPasswordError()) {
      pushToast({
        type: "error",
        title: t.settings.user.passwordErrorTitle,
        description: t.settings.user.passwordFormErrorDescription,
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      await changeCurrentUserPassword({
        currentPassword: currentPassword(),
        newPassword: newPassword(),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSubmitted(false);
      pushToast({
        type: "success",
        title: t.settings.user.passwordUpdatedTitle,
        description: t.settings.user.passwordUpdatedDescription,
      });
    } catch (error) {
      pushToast({
        type: "error",
        title: t.settings.user.passwordErrorTitle,
        description: error instanceof Error ? error.message : "Unable to change your password right now.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLinkGitHub = () => {
    try {
      startGitHubSignIn();
    } catch (error) {
      pushToast({
        type: "error",
        title: t.settings.user.githubLinkErrorTitle,
        description: error instanceof Error ? error.message : "Unable to start GitHub linking right now.",
      });
    }
  };

  return (
    <section class="space-y-4">
      <article class="motion-enter-fade-up motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="text-lg font-semibold">{t.settings.user.title}</h3>
            <p class="text-muted mt-1 text-sm">{t.settings.user.subtitle}</p>
          </div>
          <Button variant="neutral" class="px-3 py-2 text-sm" onClick={props.onBackToDashboard} type="button">
            {t.settings.user.backToDashboard}
          </Button>
        </div>

        <Show when={settings.error}>
          <p class="text-danger mt-3 text-sm">{t.settings.user.loadError}</p>
        </Show>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <p class="text-sm text-slate-500 dark:text-slate-400">{t.settings.user.primaryEmail}</p>
            <p class="mt-1 font-medium">{settings()?.email ?? props.currentUser.email}</p>
          </div>
          <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <p class="text-sm text-slate-500 dark:text-slate-400">{t.settings.user.github}</p>
            <Show
              when={settings()?.githubLinked}
              fallback={
                <div class="mt-1 flex items-center gap-2">
                  <span class="text-sm font-medium">{t.settings.user.githubNotLinked}</span>
                  <Button variant="secondary" class="px-3 py-1.5 text-xs" onClick={handleLinkGitHub} type="button">
                    {t.settings.user.linkGithub}
                  </Button>
                </div>
              }
            >
              <p class="mt-1 font-medium text-emerald-600 dark:text-emerald-400">{t.settings.user.githubLinked}</p>
            </Show>
          </div>
        </div>
      </article>

      <article class="motion-enter-fade-up motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
        <h4 class="text-base font-semibold">{t.settings.user.profileTitle}</h4>
        <form class="mt-4 space-y-4" onSubmit={handleSaveName}>
          <TextField
            autoComplete="name"
            error={nameError()}
            label={t.settings.user.fullNameLabel}
            name="fullName"
            onInput={setFullName}
            placeholder={t.settings.user.fullNamePlaceholder}
            required
            type="text"
            value={fullName()}
          />
          <Button class="px-3 py-2 text-sm" disabled={isSavingName()} type="submit">
            {isSavingName() ? t.settings.user.saveProfilePending : t.settings.user.saveProfile}
          </Button>
        </form>
      </article>

      <article class="motion-enter-fade-up motion-surface rounded-xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/75">
        <h4 class="text-base font-semibold">{t.settings.user.passwordTitle}</h4>
        <form class="mt-4 space-y-4" onSubmit={handleChangePassword}>
          <TextField
            autoComplete="current-password"
            error={currentPasswordError()}
            label={t.settings.user.currentPasswordLabel}
            name="currentPassword"
            onInput={setCurrentPassword}
            placeholder={t.settings.user.currentPasswordPlaceholder}
            required
            type="password"
            value={currentPassword()}
          />
          <TextField
            autoComplete="new-password"
            error={newPasswordError()}
            label={t.settings.user.newPasswordLabel}
            name="newPassword"
            onInput={setNewPassword}
            placeholder={t.settings.user.newPasswordPlaceholder}
            required
            type="password"
            value={newPassword()}
          />
          <TextField
            autoComplete="new-password"
            error={confirmPasswordError()}
            label={t.settings.user.confirmPasswordLabel}
            name="confirmPassword"
            onInput={setConfirmPassword}
            placeholder={t.settings.user.confirmPasswordPlaceholder}
            required
            type="password"
            value={confirmPassword()}
          />
          <Button class="px-3 py-2 text-sm" disabled={isChangingPassword()} type="submit">
            {isChangingPassword() ? t.settings.user.changePasswordPending : t.settings.user.changePassword}
          </Button>
        </form>
      </article>
    </section>
  );
}
