import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  Events
} from "discord.js";
import express from "express";

/* ================= HTTP PARA RENDER ================= */
const app = express();
app.get("/", (_, res) => res.send("Argentina RP Bot activo"));
app.listen(process.env.PORT || 3000);

/* ================= CLIENTE ================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ================= VARIABLES ================= */
const {
  TOKEN,
  CLIENT_ID,
  GUILD_ID,
  ROL_MOD,
  CANAL_SERVER_ABIERTO,
  CANAL_SERVER_CERRADO,
  CANAL_LOGS_SERVER,
  CANAL_LOGS_PLACAS
} = process.env;

/* ================= DATA PLACAS ================= */
const placas = new Map();
let contadorPlaca = 1;

/* ================= MENSAJES ================= */
const SERVER_ABIERTO_MSG = `** ¡Atención, jugadores de Argentina! 🎄🎁  
¡Grandes noticias! El servidor está ABIERTO.**

🎮 Código: \`zaza1ajv\`

||@everyone|| 🌟
`;

const SERVER_CERRADO_MSG = `🌙✨ **Muy buenas noches, Argentina RP** 🇦🇷🔥  
El servidor se encuentra cerrado por hoy.  
Gracias por el rol ❤️  
Nos vemos mañana 💙`;

/* ================= COMANDOS ================= */
const commands = [
  new SlashCommandBuilder().setName("ayuda").setDescription("Ver comandos"),
  new SlashCommandBuilder().setName("info").setDescription("Info del servidor"),
  new SlashCommandBuilder().setName("roles").setDescription("Roles"),
  new SlashCommandBuilder().setName("ticket").setDescription("Soporte"),
  new SlashCommandBuilder().setName("policia").setDescription("Postulación Policía"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Abrir o cerrar servidor")
    .addStringOption(o =>
      o.setName("estado")
        .setRequired(true)
        .addChoices(
          { name: "Activo", value: "activo" },
          { name: "Cerrado", value: "cerrado" }
        )
    ),

  new SlashCommandBuilder()
    .setName("placa")
    .setDescription("Registrar placa")
    .addStringOption(o => o.setName("nombre").setRequired(true))
    .addStringOption(o => o.setName("rango").setRequired(true))
    .addAttachmentOption(o => o.setName("foto").setRequired(true)),

  new SlashCommandBuilder()
    .setName("ver-placa")
    .setDescription("Ver placa de usuario")
    .addUserOption(o => o.setName("usuario").setRequired(true)),

  new SlashCommandBuilder()
    .setName("borrar-placa")
    .setDescription("Borrar placa")
    .addUserOption(o => o.setName("usuario").setRequired(true)),

  new SlashCommandBuilder()
    .setName("lista-de-placas")
    .setDescription("Ver todas las placas")
].map(c => c.toJSON());

/* ================= REGISTRO ================= */
const rest = new REST({ version: "10" }).setToken(TOKEN);
await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

/* ================= READY ================= */
client.once("ready", () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

/* ================= INTERACCIONES ================= */
client.on(Events.InteractionCreate, async i => {
  if (!i.isChatInputCommand()) return;

  const esMod = i.member.roles.cache.has(ROL_MOD);

  /* SERVER */
  if (i.commandName === "server") {
    if (!esMod) return i.reply({ content: "❌ Sin permisos", flags: 64 });

    const estado = i.options.getString("estado");
    const canal = await client.channels.fetch(
      estado === "activo" ? CANAL_SERVER_ABIERTO : CANAL_SERVER_CERRADO
    );

    await canal.send(estado === "activo" ? SERVER_ABIERTO_MSG : SERVER_CERRADO_MSG);

    const logs = await client.channels.fetch(CANAL_LOGS_SERVER);
    await logs.send(`📢 ${i.user.tag} puso el servidor **${estado.toUpperCase()}**`);

    return i.reply({ content: "✅ Listo", flags: 64 });
  }

  /* PLACA */
  if (i.commandName === "placa") {
    if (placas.has(i.user.id))
      return i.reply({ content: "❌ Ya tenés placa", flags: 64 });

    const placaId = `P${String(contadorPlaca++).padStart(3, "0")}`;
    const nombre = i.options.getString("nombre");
    const rango = i.options.getString("rango");
    const foto = i.options.getAttachment("foto");

    placas.set(i.user.id, { nombre, rango, placaId, foto: foto.url });

    await i.member.setNickname(`${rango} || ${nombre} #${placaId}`);

    const canal = await client.channels.fetch(CANAL_LOGS_PLACAS);
    await canal.send(
      `# 🪪 Placa asignada\n\n👤 ${i.user}\n🎖 Rango: ${rango}\n🔢 Placa: ${placaId}\n📸 ${foto.url}`
    );

    return i.reply({ content: `✅ Placa ${placaId} asignada`, flags: 64 });
  }

  if (i.commandName === "ver-placa") {
    if (!esMod) return i.reply({ content: "❌ Sin permisos", flags: 64 });
    const u = i.options.getUser("usuario");
    const p = placas.get(u.id);
    if (!p) return i.reply({ content: "❌ No tiene placa", flags: 64 });

    return i.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🪪 Placa")
          .setDescription(
            `👤 ${u}\n🎖 ${p.rango}\n🔢 ${p.placaId}`
          )
          .setImage(p.foto)
      ],
      flags: 64
    });
  }

  if (i.commandName === "borrar-placa") {
    if (!esMod) return i.reply({ content: "❌ Sin permisos", flags: 64 });
    placas.delete(i.options.getUser("usuario").id);
    return i.reply({ content: "🗑 Placa borrada", flags: 64 });
  }

  if (i.commandName === "lista-de-placas") {
    let txt = "";
    placas.forEach((v, k) => {
      txt += `• <@${k}> — ${v.placaId} (${v.rango})\n`;
    });
    return i.reply({ content: txt || "Sin placas", flags: 64 });
  }
});

/* ================= LOGIN ================= */
client.login(TOKEN);
