// ==UserScript==
// @name         WebSocket Data Viewer
// @namespace    https://github.com/Lemons1337/WebSocket-Data-Viewer
// @version      0.1.2
// @description  try to take over the world!
// @author       Lemons
// @match        *://*/*
// @run-at       document-start
// @require      https://cdnjs.cloudflare.com/ajax/libs/msgpack-lite/0.1.26/msgpack.min.js
// @grant        none
// ==/UserScript==

window.msgpack = msgpack;

let websocket_blacklist = ["t", "gmsg", "ts", "k", "l", "pi", "pir"];

function unpack(data) {
	if (data instanceof DataView) data = new Uint8Array(data.buffer);
	else if (data instanceof ArrayBuffer) data = new Uint8Array(data);
	else try { data = JSON.parse(data); } catch (err) {}
	try { data = msgpack.decode(data); } catch (err) {}
	return data;
}

function websocket_replace(packet, dir){
	console.log(packet, dir);
    	if (dir === "down" && packet[0] === "sb") packet[1] = ["All hail DQ", "Beep boop", "Made by SwatDoge", "Join the game to get started"][Math.floor(Math.random() * 4)]; return packet;
	
	return packet;
}

window.WebSocket = class extends window.WebSocket {
    constructor(...args){
        super(...args);
        this.addEventListener("open", event => {
            let incoming = this.onmessage, outgoing = this.send;
            function packet_modify(packet, dir){
                let unpacked_data = unpack(packet[0].data ? packet[0].data : packet[0]), last_bytes = new Uint8Array(packet[0].data).slice(-2);
                if (websocket_blacklist.includes(unpacked_data[0])) return packet;
                unpacked_data = websocket_replace(unpacked_data, dir);

                let l = new Uint8Array([...msgpack.encode(unpacked_data), ...last_bytes]);
                Object.defineProperty(packet[0], "data", {get: () => l.buffer});
                return packet;
            }

            this.onmessage = function(){return incoming.apply(this, packet_modify(arguments, "down"));}
            this.send = function(){return outgoing.apply(this, packet_modify(arguments, "up"));}
        });
    }
};
