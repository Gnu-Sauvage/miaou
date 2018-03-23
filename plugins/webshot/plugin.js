const phantom = require('phantom');
const WIDTH = 1400;
const HEIGHT = 1000;

exports.name = "webshot";

let sendToImgur;
let bench;

exports.init = function(miaou){
	sendToImgur = miaou.lib("upload").sendImageToImgur;
	bench = miaou.lib("bench");
}

async function onCommand(ct){
	const urlMatch = ct.args.match(/\bhttps?:\/\/\S+/);
	if (!urlMatch) throw new Error("This command needs an URL as argument");
	const url = urlMatch[0];
	console.log('url:', url);
	let width = WIDTH;
	let height = HEIGHT;
	const sizeMatch = ct.args.match(/\b(\d+)\s*(?:x|\*)\s*(\d+)\b/);
	if (sizeMatch) {
		width = sizeMatch[1];
		height = sizeMatch[2];
		if (width<10) throw new Error("invalid width");
		if (height<10) throw new Error("invalid height");
		if (height*width>3000*2000) throw new Error("requested size too big");
	}
	const instance = await phantom.create();
	let bo = bench.start("webshot");
	const page = await instance.createPage();
	await page.property('viewportSize', {width, height});
	const status = await page.open(url);
	console.log('status:', status);
	let b64 = await page.renderBase64("png");
	await instance.exit();
	let data = await sendToImgur(b64);
	console.log('data:', data);
	if (!data.link) { // should not happen, I think (because handled in "upload" lib
		if (data.error) {
			throw new Error("Imgur sent an error: " + data.error);
		} else {
			throw new Error("Something failed"); // should not happen because handled in
		}
	}
	bo.end();
	ct.reply(`Screenshot of ${url} :\n${data.link}`);
}

exports.registerCommands = function(registerCommand){
	registerCommand({
		name:'webshot',
		fun:onCommand,
		help:"takes a screenshot of a website. Example: `!!webshot https://dystroy.org`",
		detailedHelp:"You can also precise the dimension of the virtual browser:"
			+ "\n* `!!!!webshot https://dystroy.org 200x3000`"
	});
}

