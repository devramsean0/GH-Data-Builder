class Logger {
    public info(message: string): void {
        console.log(`[INFO] ${message}`);
    }
    public warn(message: string): void {
        console.log(`[WARN] ${message}`);
    }
    public error(message: string): void {
        console.log(`[ERROR] ${message}`);
    }
}

export default new Logger();