"use server";
import {
  signup,
  login,
  logout,
  changePassword,
  resetPassword,
} from "@/lib/services/auth-service";
import { requireUser } from "@/lib/auth/session";
import { sendEmail, Emails } from "@/lib/services/notification-service";
import { type ActionResult, toError } from "@/lib/actions/result";

export async function signupAction(input: {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}): Promise<ActionResult<{ role: string; confirmed: boolean }>> {
  try {
    const { profile, confirmed } = await signup(input);
    // Welcome + Terms-acceptance confirmation emails.
    await sendEmail({ to: profile.email, ...Emails.welcome(profile.name) });
    await sendEmail({ to: profile.email, ...Emails.termsAccepted(profile.name) });
    return { ok: true, data: { role: profile.role, confirmed } };
  } catch (err) {
    return toError(err);
  }
}

export async function forgotPasswordAction(input: {
  email: string;
}): Promise<ActionResult> {
  try {
    await resetPassword(input);
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<ActionResult<{ role: string }>> {
  try {
    const profile = await login(input);
    return { ok: true, data: { role: profile.role } };
  } catch (err) {
    return toError(err);
  }
}

export async function changePasswordAction(input: {
  password: string;
}): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await changePassword(user, input);
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    await logout();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
