import fs from 'fs';

export default function logger(...args: any[]) {
    const content = args.reduce((prevRes, curItem) => {
        let str = '';
        if (typeof curItem === 'object' && curItem !== null) {
            str = JSON.stringify(curItem, null, 2);
        } else {
            str = String(curItem);
        }
        return prevRes + str;
    }, '');
    fs.writeFileSync('./log', content, {
        flag: 'a',
    });
}
