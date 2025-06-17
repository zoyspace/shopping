// 環境変数デバッグスクリプト
console.log("=== Environment Variables Debug ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
console.log(
	"STRIPE_SECRET_KEY value (first 10 chars):",
	process.env.STRIPE_SECRET_KEY?.substring(0, 10),
);
console.log(
	"NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY exists:",
	!!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);
console.log(
	"STRIPE_WEBHOOK_SECRET exists:",
	!!process.env.STRIPE_WEBHOOK_SECRET,
);
console.log(
	"SUPABASE_SERVICE_ROLE_KEY exists:",
	!!process.env.SUPABASE_SERVICE_ROLE_KEY,
);

console.log("\n=== All STRIPE-related env vars ===");
Object.keys(process.env)
	.filter((key) => key.includes("STRIPE"))
	.forEach((key) => {
		console.log(`${key}:`, process.env[key] ? "Set" : "Not set");
	});

console.log("\n=== Process info ===");
console.log("Platform:", process.platform);
console.log("Node version:", process.version);
console.log("Working directory:", process.cwd());

// .env.local ファイルの存在確認
const fs = require("fs");
const path = require("path");
const envLocalPath = path.join(process.cwd(), ".env.local");
console.log("\n=== .env.local file ===");
console.log("Path:", envLocalPath);
console.log("Exists:", fs.existsSync(envLocalPath));

if (fs.existsSync(envLocalPath)) {
	try {
		const content = fs.readFileSync(envLocalPath, "utf8");
		const lines = content
			.split("\n")
			.filter((line) => line.trim() && !line.startsWith("#"));
		console.log("Lines in .env.local:", lines.length);
		console.log(
			"STRIPE-related lines:",
			lines.filter((line) => line.includes("STRIPE")).length,
		);
	} catch (error) {
		console.error("Error reading .env.local:", error.message);
	}
}
