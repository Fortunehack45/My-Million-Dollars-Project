// Updated error message for authorization failure
const email = getUserEmail(); // hypothetical function to get user's email
const requiredEmail = 'required@example.com'; // hypothetical required email
const userRole = getUserRole(); // hypothetical function to get user's role

if (!isAuthorized(email, requiredEmail, userRole)) {
    throw new Error(`Authorization failed. Your email: ${email}. Required email: ${requiredEmail}. Required role: Admin.`);
}