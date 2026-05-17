import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { editProfile } from '../../lib/api/user';
import { editProfileValidationSchema } from '../../lib/validation/auth';
import { notification } from '../../lib/notifications';
import type { EditProfileFormData } from '../../types/auth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUsername: string;
  initialDisplayName: string;
  onSuccess: (newUsername: string, newDisplayName: string) => void;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  initialUsername,
  initialDisplayName,
  onSuccess,
}: EditProfileModalProps) => {
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (values: EditProfileFormData, { setSubmitting }: { setSubmitting: (v: boolean) => void }) => {
    setServerError(null);
    notification.loading({ title: 'Updating', message: 'Please wait...' });

    const response = await editProfile(values);

    notification.close();

    if (response.success) {
      notification.success('Success', 'Profile updated successfully');
      onSuccess(values.username, values.displayName);
      onClose();
    } else {
      setServerError(response.message ?? 'Failed to update profile');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>

        {serverError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{serverError}</p>
          </div>
        )}

        <Formik
          initialValues={{
            username: initialUsername,
            displayName: initialDisplayName,
          }}
          validationSchema={editProfileValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <Field
                  name="username"
                  type="text"
                  className="w-full px-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] transition-colors"
                  placeholder="Enter username"
                />
                <ErrorMessage
                  name="username"
                  component="span"
                  className="mt-1 block text-xs font-medium text-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <Field
                  name="displayName"
                  type="text"
                  className="w-full px-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] transition-colors"
                  placeholder="Enter display name"
                />
                <ErrorMessage
                  name="displayName"
                  component="span"
                  className="mt-1 block text-xs font-medium text-red-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-medium hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-[#22D3EE] text-[#071626] rounded-xl font-semibold hover:bg-[#67e8f9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};