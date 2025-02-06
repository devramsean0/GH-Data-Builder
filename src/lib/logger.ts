import {green, blue, yellow, red} from "colorette";

class Logger {
    private _formate_date() {
        const date = new Date(Date.now());
        return blue(`[${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`);
    }
    public info(message: string): void {
        console.log(`${this._formate_date()} ${green('[INFO]')} ${message}`);
    }
    public warn(message: string): void {
        console.log(`[${this._formate_date()}] ${yellow('[WARN]')} ${message}`);
    }
    public error(message: string): void {
        console.log(`[${this._formate_date()}] ${red('[ERROR]')} ${message}`);
    }
}

export default new Logger();