# Dayflow HRMS - Master Demo Script

Use this script to demonstrate the full capabilities of the Dayflow application from start to finish.

## Phase 1: The Administrator View (Manager)

**Objective:** Show how easy it is to manage a company.

1.  **Login:**
    *   **User:** `admin` / `admin`
    *   **Impact:** Land on the **Dashboard**. Point out the high-level stats (Total Employees, Attendance, etc.).

2.  **Onboard an Employee:**
    *   Navigate to **Employees**.
    *   Click **Add Employee**.
    *   Fill in: Name ("Alice Dev"), Email ("alice@dayflow.io"), Mobile, Job Title ("Senior React Dev").
    *   **Click Save.**
    *   *Highlight:* The system instantly creates the record in Odoo's backend.

3.  **Grant Access (RBAC):**
    *   Find "Alice Dev" in the list.
    *   Click the **Grant Access** key icon.
    *   Create a user for her (Email: `alice`, Pass: `alice`).
    *   *Highlight:* seamless integration between HR Record and User System.

4.  **Process Attendance (Manager View):**
    *   Navigate to **Attendance**.
    *   Show the **Team Overview** table.
    *   See active check-ins in real-time.

5.  **Review Leaves:**
    *   Navigate to **Leave**.
    *   Switch to **Approvals** tab.
    *   (If empty, note that you will create one as Alice later).
    *   Explain the Manager's role in approving time off.

6.  **Run Payroll:**
    *   Navigate to **Payroll**.
    *   Click **Generate Slip**.
    *   Select "Alice Dev", Enter Wage ($5000), Allowances ($500).
    *   Click **Generate**.
    *   Show the calculated **Net Pay** and "PAID" badge.

---

## Phase 2: The Employee View (User Experience)

**Objective:** Show the beautiful, self-service portal for staff.

1.  **Switch Context:**
    *   Log out (`Sign Out` button).
    *   Log in as **Alice**: `alice` / `admin` (or whatever password you set, often defaults to `admin` in local dev if not strictly forced).

2.  **Check In (Attendance):**
    *   Navigate to **Attendance**.
    *   Click the big blue **Start Work** button.
    *   Watch the timer start (mocking real-time tracking).
    *   *Highlight:* "One-tap check-in".

3.  **Request Time Off:**
    *   Navigate to **Leave**.
    *   Click **New Request**.
    *   Type: "Sick Time", Dates: [Tomorrow] to [Day After].
    *   Click **Submit**.
    *   Show the "Pending" badge.

4.  **View Performance:**
    *   Navigate to **Performance**.
    *   See "My Reviews". (Likely empty until Manager creates one).

5.  **Check Pay:**
    *   Navigate to **Payroll**.
    *   See the Payslip created in Phase 1.
    *   *Highlight:* Transparency and instant access to financial data.

---

## Phase 3: Closing the Loop

1.  **Log back in as Admin.**
2.  **Approve Leave:**
    *   Go to **Leave -> Approvals**.
    *   See Alice's request.
    *   Click **Approve**.
3.  **Create Performance Review:**
    *   Go to **Performance**.
    *   Click **New Review** -> Create for Alice ("Q1 Review").
    *   **Edit Rating:** Give 5 stars.
    *   **Feedback:** "Alice has been exceptional in shipping features."
    *   **Finalize.**
4.  **Final Switch:**
    *   Login as Alice one last time.
    *   Show **Approved** Leave.
    *   Show **5-Star** Review.

**End of Demo.**
