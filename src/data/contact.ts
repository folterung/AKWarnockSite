export const contactInfo = {
  title: 'Contact | A.K. Warnock',
  description: 'Get in touch with A.K. Warnock',
  form: {
    title: 'Contact Us',
    subtitle: 'Have a question or want to get in touch? Fill out the form below.',
    fields: {
      name: {
        label: 'Name',
        placeholder: 'Your name',
        required: true,
        maxLength: 100,
      },
      email: {
        label: 'Email',
        placeholder: 'your.email@example.com',
        required: true,
        maxLength: 100,
      },
      phone: {
        label: 'Phone (optional)',
        placeholder: 'Your phone number',
        maxLength: 20,
      },
      preferredMethod: {
        label: 'Preferred Method of Communication',
        options: [
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'either', label: 'Either' },
        ],
      },
      message: {
        label: 'Message',
        placeholder: 'Your message (max 1000 characters)',
        required: true,
        maxLength: 1000,
      },
    },
    submitButton: 'Send Message',
    loadingText: 'Sending...',
  },
}; 