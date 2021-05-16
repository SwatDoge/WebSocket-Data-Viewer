// ==UserScript==
// @name         Websocket Data Viewer
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

let websocket_blacklist = ["t", "pi", "po", "0", "7", "pir", "9"];

function unpack(data) {
	if (data instanceof DataView) data = new Uint8Array(data.buffer);
	else if (data instanceof ArrayBuffer) data = new Uint8Array(data);
	else try { data = JSON.parse(data); } catch (err) {}
	try { data = msgpack.decode(data); } catch (err) {}
	return data;
}

function websocket_replace(packet, dir){
    if (dir === "down" && packet[0] === "sb"){ packet[1] = ["All hail DQ", "Beep boop", "Made by SwatDoge", "Join the game to get started"][Math.floor(Math.random() * 4)]; return packet};
    if (dir === "up" && packet[0] === "a"){ packet = ["po"]; return packet };
    return packet
}

function packet_modify(packet, dir){
    let unpacked_data = unpack(packet), last_bytes = new Uint8Array(packet).slice(-2);
    if (websocket_blacklist.includes(unpacked_data[0])) return packet;
    unpacked_data = websocket_replace(unpacked_data, dir);

    console.log(unpacked_data, dir);
	
    return new Uint8Array([...msgpack.encode(unpacked_data), ...last_bytes]);
}

window.WebSocket = class extends window.WebSocket {
    constructor(...args){
        super(...args);
        this.addEventListener("message", event => {
            Object.defineProperty(event, 'data', {value: packet_modify(event.data, "down")});
        });
        this.addEventListener("open", event => {
            let send = this.send;
            this.send = function(){
                arguments[0] = packet_modify(arguments[0], "up");
                return send.apply(this, arguments);
            }
        })
    }
};
