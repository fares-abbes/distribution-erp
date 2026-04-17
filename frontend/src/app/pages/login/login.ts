import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styles: [`
    .nf-login {
      display: flex;
      min-height: 100vh;
      background: var(--surface);
    }

    /* ── Brand Panel ── */
    .nf-login__brand {
      display: none;
      width: 42%;
      flex-direction: column;
      justify-content: space-between;
      background: var(--surface-container-low);
      padding: 48px;
      position: relative;
      overflow: hidden;
    }
    @media (min-width: 1024px) {
      .nf-login__brand { display: flex; }
    }
    .nf-login__bg-decor {
      position: absolute;
      inset: 0;
      opacity: 0.06;
      pointer-events: none;
    }
    .nf-login__orb {
      position: absolute;
      border-radius: 50%;
    }
    .nf-login__orb--blue {
      top: 0; right: 0;
      width: 380px; height: 380px;
      background: var(--primary);
      transform: translate(50%, -50%);
    }
    .nf-login__orb--emerald {
      bottom: 0; left: 0;
      width: 300px; height: 300px;
      background: var(--tertiary);
      transform: translate(-50%, 50%);
    }
    .nf-login__brand-content { position: relative; z-index: 1; }
    .nf-login__logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 64px;
    }
    .nf-login__logo-icon {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px 2px rgba(0, 31, 65, 0.1);
    }
    .nf-login__logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--on-surface);
      letter-spacing: -0.02em;
    }
    .nf-login__headline {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--on-surface);
      line-height: 1.15;
      margin-bottom: 16px;
      letter-spacing: -0.03em;
    }
    .nf-login__headline-accent {
      color: var(--primary);
    }
    .nf-login__subtitle {
      font-size: 0.9375rem;
      color: var(--on-surface-variant);
      line-height: 1.6;
      margin-bottom: 48px;
    }
    .nf-login__features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .nf-login__feature {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--on-surface-variant);
      font-size: 0.8125rem;
    }
    .nf-login__feature-icon {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: var(--surface-container);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .nf-login__footer {
      position: relative; z-index: 1;
      font-size: 0.6875rem;
      color: var(--outline);
    }

    /* ── Form Panel ── */
    .nf-login__form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background: var(--surface);
    }
    .nf-login__form-wrapper {
      width: 100%;
      max-width: 420px;
    }
    .nf-login__mobile-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 40px;
    }
    @media (min-width: 1024px) {
      .nf-login__mobile-logo { display: none; }
    }

    .nf-login__card {
      background: var(--surface-container);
      border-radius: 16px;
      padding: 32px;
      border: 1px solid rgba(67, 71, 79, 0.15);
    }
    .nf-login__card-header {
      margin-bottom: 32px;
    }
    .nf-login__card-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--on-surface);
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    .nf-login__card-desc {
      font-size: 0.8125rem;
      color: var(--on-surface-variant);
    }

    .nf-login__sso-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 14px 24px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
      color: var(--on-primary);
      font-weight: 600;
      font-size: 0.875rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 0 24px 2px rgba(0, 31, 65, 0.05);
    }
    .nf-login__sso-btn:hover {
      box-shadow: 0 0 32px 6px rgba(0, 31, 65, 0.1);
      transform: translateY(-1px);
    }
    .nf-login__sso-btn:active {
      transform: translateY(0);
    }

    .nf-login__info {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(67, 71, 79, 0.15);
      text-align: center;
    }
    .nf-login__info p {
      font-size: 0.6875rem;
      color: var(--outline);
      line-height: 1.5;
    }

    .nf-login__secured {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
      font-size: 0.6875rem;
      color: var(--outline);
    }
    .nf-login__secured strong {
      color: var(--on-surface-variant);
    }
  `],
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    this.auth.login();
  }
}
