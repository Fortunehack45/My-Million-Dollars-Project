
const fs = require('fs');
const content = fs.readFileSync('c:/Users/ALEX/Argus/My-Million-Dollars-Project/pages/AdminPanel.tsx', 'utf8');

let stack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
        if (char === '{' || char === '(' || char === '<') {
            // Ignore < if it's not a tag start or if it's <=
            if (char === '<' && (line[j + 1] === ' ' || line[j + 1] === '=')) continue;
            stack.push({ char, line: i + 1, col: j + 1 });
        } else if (char === '}' || char === ')' || char === '>') {
            if (char === '>' && (line[j - 1] === '=' || line[j - 1] === '-')) continue;
            let last = stack.pop();
            if (!last) {
                console.log(`Unmatched ${char} at line ${i + 1}, col ${j + 1}`);
                continue;
            }
            if ((char === '}' && last.char !== '{') ||
                (char === ')' && last.char !== '(')) {
                console.log(`Mismatch: ${last.char} at ${last.line}:${last.col} closed by ${char} at ${i + 1}:${j + 1}`);
            }
        }
    }
}
console.log('Balance check complete');
