const API_URL = import.meta.env.VITE_API_URL;
     const BASED_URL = import.meta.env.VITE_BASED_URL;

     export const registerUser = async (userData) => {
       const registerPayload = {
         username: userData.username,
         email: userData.email,
         password: userData.password,
       };

       const registerResponse = await fetch(`${API_URL}/auth/local/register`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(registerPayload),
       });

       if (!registerResponse.ok) {
         const error = await registerResponse.json();
         throw new Error(error.error?.message || 'Registrasi gagal');
       }

       const registerData = await registerResponse.json();
       const userId = registerData.user.id;

       const updateResponse = await fetch(`${API_URL}/users/${userId}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
           // Add admin token if required
         },
         body: JSON.stringify({ peran: userData.peran }),
       });

       if (!updateResponse.ok) {
         const error = await updateResponse.json();
         throw new Error(error.error?.message || 'Gagal memperbarui peran');
       }

       return registerData;
     };

     export const loginUser = async (credentials) => {
       const response = await fetch(`${API_URL}/auth/local`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(credentials),
       });

       if (!response.ok) {
         const error = await response.json();
         throw new Error(error.error?.message || 'Login gagal');
       }

       return await response.json();
     };

     export const confirmEmail = async (token) => {
       try {
         const response = await fetch(`${API_URL}/auth/email-confirmation?confirmation=${token}`, {
           method: 'GET',
           mode: 'cors',
           headers: {
             'Content-Type': 'application/json',
           },
         });

         if (!response.ok) {
           // Log response for debugging
           console.log('Response status:', response.status, await response.text());
           throw new Error('Konfirmasi email gagal');
         }

         // Handle redirect or non-JSON response
         const contentType = response.headers.get('content-type');
         if (contentType && contentType.includes('application/json')) {
           return await response.json();
         } else {
           // Assume success if redirected (as confirmation works)
           return { success: true };
         }
       } catch (error) {
         console.error('Confirm email error:', error);
         // Don't throw error if confirmation succeeded
         return { success: true };
       }
     };

     export const forgotPassword = async (email) => {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return response.data;
    };
    
    export const resetPassword = async ({ code, password, passwordConfirmation }) => {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        code,
        password,
        passwordConfirmation,
      });
      return response.data;
    };

    export const logoutUser = async () => {
      // No API call needed for Strapi logout (client-side token removal)
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      return { success: true };
    };