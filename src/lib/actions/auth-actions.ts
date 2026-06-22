"use server";
import { signup, login, logout } from "@/lib/services/auth-service";
import { sendEmail, Emails } from "@/lib/services/notification-service";
import { type ActionResult, toError } from "@/lib/actions/result";

export async function signupAction(input: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionResult<{ role: string }>> {
  try {
    const profile = await signup(input);
    const tpl = Emails.welcome(profile.name);
    await sendEmail({ to: profile.email, ...tpl });
    return { ok: true, data: { role: profile.role } };
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

export async function logoutAction(): Promise<ActionResult> {
  try {
    await logout();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
