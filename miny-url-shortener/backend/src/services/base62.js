const XOR_SECRET = parseInt(process.env.XOR_SECRET) || 20260228
const SHUFFLE_KEY = process.env.SHUFFLE_KEY || "miny_secret_key"

const BASE_CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';


function deterministicShuffle(str, key) {
    const seed = key.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0)
    }, 0)
    const arr = str.split("");

    let s = seed;
    const random = () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff
        return (s >>> 0) / 0xffffffff  // normalize to 0-1
    }
    // Fisher-Yates shuffle using our seeded random
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]  // swap
    }

    return arr.join('')
}

const CHARSET = deterministicShuffle(BASE_CHARSET, SHUFFLE_KEY)
const BASE = CHARSET.length

function xorScramble(id) {
    return id ^ XOR_SECRET
}


export function encode(num) {
    // Step 1: XOR scramble the ID
    const scrambled = xorScramble(num)

    // Step 2: Base62 encode using shuffled charset
    if (scrambled === 0) return CHARSET[0]

    let result = ''
    let n = scrambled

    while (n > 0) {
        result = CHARSET[n % BASE] + result
        n = Math.floor(n / BASE)
    }

    return result
}

export function decode(str) {
    // Step 1: Base62 decode using shuffled charset
    let scrambled = 0

    for (let i = 0; i < str.length; i++) {
        scrambled = scrambled * BASE + CHARSET.indexOf(str[i])
    }

    // Step 2: XOR unscramble to get back original ID
    return xorScramble(scrambled)
}