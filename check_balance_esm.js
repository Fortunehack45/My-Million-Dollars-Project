
import fs from 'fs';
const content = fs.readFileSync('c:/Users/ALEX/Argus/My-Million-Dollars-Project/pages/AdminPanel.tsx', 'utf8');

let stack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
        // Only track curly and paren
        if (char === '{' || char === '(') {
            stack.push({ char, line: i + 1, col: j + 1 });
        } else if (char === '}' || char === ')') {
            let last = stack.pop();
            if (!last) {
                console.log(`Unmatched ${char} at line ${i + 1}, col ${j + 1}`);
                continue;
            }
            if ((char === '}' && last.char !== '{') ||
                (char === ')' && last.char !== '(')) {
                console.log(`Mismatch: ${last.char} at ${last.line}:${last.col} closed by ${char} at ${i + 1}:${j + 1}`);
                // Put it back to try to continue? No, usually first error is key.
            }
        }
    }
}
if (stack.length > 0) {
    console.log(`${stack.length} unclosed brackets remained.`);
    stack.forEach(s => console.log(`Unclosed ${s.char} at ${s.line}:${s.col}`));
} else {
    console.log('All braces and parentheses are balanced.');
}
