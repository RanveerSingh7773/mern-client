export const getInputClass = (field, touched, errors) =>
    `appearance-none rounded-md block w-full px-3 py-3 border bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:z-10 sm:text-sm transition duration-300 ${
        touched[field] && errors[field]
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-gray-200 focus:ring-yellow-600 focus:border-yellow-600'
    }`;
