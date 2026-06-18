# The Guild — Feature Matrix (Source of Truth)

> Grounded in the actual Django `urls.py`/`views.py` and the Next.js
> `src/services/*` + pages. Status reflects state **after** the gap-closure pass.
>
> Legend: ✅ Fully implemented (UI → API → DB → response) · ❌ Missing backend ·
> 🚫 Missing frontend · ⚠️ Partial / intentional.

## Auth & Identity
| Feature | Frontend | Backend | Status | Action taken |
|---|---|---|---|---|
| Login (password) | ✅ | ✅ | ✅ | cookie-based |
| **MFA / 2FA login** | **was 🚫** | ✅ | ✅ | **Added OTP step to login page + `verifyMfa` flow** |
| MFA setup/confirm/disable | 🚫 | ✅ | ⚠️ | Backend ready; settings UI deferred (service callable) |
| Register | ✅ | ✅ | ✅ | — |
| Logout | ✅ | ✅ | ✅ | cookie clear + refresh blacklist |
| Token refresh | ✅ | ✅ | ✅ | httpOnly cookie |
| Profile view/edit | ✅ | ✅ | ✅ | — |
| **Forgot password** | **was ❌** | ❌ | ✅ removed | **Dead link removed** (no reset endpoint exists) |
| Staff invitations / join | ✅ | ✅ | ✅ | — |

## Bookings
| Feature | Frontend | Backend | Status | Action taken |
|---|---|---|---|---|
| List / create / detail / status | ✅ | ✅ | ✅ | — |
| My / provider / availability / active | ✅ | ✅ | ✅ | — |
| Assign staff, SOS, add-extra, cancel-refund, SOP, contact-log | ✅ | ✅ | ✅ | — |
| Reviews, shifts | ✅ | ✅ | ✅ | — |
| **Payment confirm** | **was 🚫** | ✅ | ⚠️ | **Service method added** (`confirmPayment`) — wire to payment UI |
| **Recurring occurrences + complete** | **was 🚫** | ✅ | ⚠️ | **Service methods added** (`getOccurrences`, `completeOccurrence`) |

## Marketplace · Wallet · Social · Inbox · Analytics
| Area | Status | Notes |
|---|---|---|
| Marketplace (products, cart, orders, checkout, inventory, logistics, fee, dispatch) | ✅ | fully wired |
| Wallet (info, fund, verify, withdraw, banks, escrow, payout, transactions, intent) | ✅ | fully wired |
| Paystack webhook | ⚠️ | backend-only **by design** (external callback, HMAC-verified) |
| Social (favorites, reviews, reply, moderate) | ✅ | fully wired |
| Inbox (conversations, messages, smart-replies) | ✅ | fully wired |
| Analytics (4 business + 4 admin endpoints) | ✅ | all consumed |

## Maestro (Discovery / Portal)
| Feature | Frontend | Backend | Status | Action taken |
|---|---|---|---|---|
| Discovery, categories, cities, recommendations, chat | ✅ | ✅ | ✅ | (`/maestro/chatbot/`→`/chat/` fixed earlier) |
| Business detail / portfolio / services / portal | ✅ | ✅ | ✅ | — |
| **Staff match** | **was 🚫** | ✅ | ⚠️ | **Service method added** (`staffMatch`) |
| **Admin business verification queue + decision** | **was 🚫** | ✅ | ✅ | **New page `/admin/businesses` + service methods** |

## Trust / Verification
| Feature | Frontend | Backend | Status | Action taken |
|---|---|---|---|---|
| Document upload, status | ✅ | ✅ | ✅ | — |
| **Admin manual document review** | **was 🚫** | ✅ | ⚠️ | **Service method added** (`reviewDocument`) |

## Admin / Platform
| Feature | Frontend | Backend | Status | Action taken |
|---|---|---|---|---|
| User verification queue + verify | ✅ | ✅ | ✅ | — |
| **Audit trail** | **was 🚫** | ✅ | ✅ | **New page `/admin/audit` + `audit.service`** |
| Admin nav links | **was ❌** | n/a | ✅ | **Sidebar pointed to 3 nonexistent routes; repointed to real pages** |

---

## 📦 Output summary

🔴 **CRITICAL GAPS (broke the system)**
- **MFA login impossible** — backend issued an MFA challenge but the frontend
  just threw an error, so any 2FA-enabled account was locked out. **FIXED** (OTP step).

🟠 **MAJOR GAPS (broke features)**
- **Admin sidebar → 3 dead routes** (`/admin/verification`, `/admin/users`,
  `/admin/disputes`) while real admin pages were unreachable. **FIXED.**
- **Business verification queue** (maestro admin) had no UI. **FIXED** (new page).
- **Audit trail** had no UI. **FIXED** (new page).

🟡 **MINOR GAPS (incomplete flows — service layer now present, UI to follow)**
- Payment-confirm, recurring occurrences/complete, staff-match, manual document
  review, MFA setup/disable: backend + typed service methods now exist; UI
  surfaces are deferred (not speculative-built).

🟢 **CLEANUP**
- Removed dead "Forgot Password" link (no reset endpoint).
- Endpoint alignment already enforced in the API contract pass (1 action → 1 route).

## Endpoint alignment (Step 4)
Every frontend action maps to exactly one backend route (see
`the-guild-backend/API_CONTRACT.md`). The only intentional backend-only endpoint
is the **Paystack webhook** (external, HMAC-verified). No duplicate routes, no
"almost-matching" names remain.
