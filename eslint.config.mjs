import next from 'eslint-config-next'

const config = [
    ...next,
    {
        rules: {
            'react-hooks/exhaustive-deps': 'warn',
            'react-hooks/immutability': 'off',
            'react-hooks/preserve-manual-memoization': 'off',
            'react-hooks/purity': 'off',
            'react-hooks/set-state-in-effect': 'off',
            'react/no-unescaped-entities': 'off',
        },
    },
]

export default config
