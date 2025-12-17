import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} from "discord.js";
import express from "express";
import fs from "fs";

/* ================= HTTP ================= */
const app = express();
app.get("/", (_, res) => res.send("Argentina RP Bot 24/7"));
app.listen(process.env.PORT || 3000);

/* ================= CLIENT ================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

/* ================= VARIABLES ================= */
const {
  TOKEN,
  CLIENT_ID,
  GUILD_ID,
  ROL_MOD_ID,
  CANAL_REGISTRO_PLACAS,
  CANAL_LOGS
} = process.env;

const CANAL_TICKETS =
  "https://discord.com/channels/1338912774327238778/1338919287842410516";

/* ================= DB PLACAS ================= */
const DB_FILE = "./placas.json";
let db = fs.existsSync(DB_FILE)
  ? JSON.parse(fs.readFileSync(DB_FILE))
  : { contador: 0, usuarios: {} };

const guardarDB = () =>
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

/* ================= COMANDOS ================= */
const commands = [
  new SlashCommandBuilder().setName("ayuda").setDescription("Comandos disponibles"),
  new SlashCommandBuilder().setName("info").setDescription("Info del servidor"),
  new SlashCommandBuilder().setName("roles").setDescription("Roles disponibles"),
  new SlashCommandBuilder().setName("ticket").setDescription("Soporte"),
  new SlashCommandBuilder().setName("policia").setDescription("Postulación Policía"),

  new SlashCommandBuilder()
    .setName("placa")
    .setDescription("Registrar placa")
    .addStringOption(o => o.setName("nombre").setRequired(true))
    .addStringOption(o => o.setName("rango").setRequired(true))
    .addAttachmentOption(o => o.setName("foto").setRequired(true)),

  new SlashCommandBuilder()
    .setName("ver-placa")
    .setDescription("Ver placa (mods)")
    .addUserOption(o => o.setName("usuario").setRequired(true)),

  new SlashCommandBuilder()
    .setName("borrar-placa")
    .setDescription("Borrar placa (mods)")
    .addUserOption(o => o.setName("usuario").setRequired(true)),

  new SlashCommandBuilder()
    .setName("lista-de-placas")
    .setDescription("Lista completa de placas (mods)"),

  new SlashCommandBuilder().setName("servidor-abrir").setDescription("Abrir servidor"),
  new SlashCommandBuilder().setName("servidor-cerrar").setDescription("Cerrar servidor")
].map(c => c.toJSON());

/* ================= REGISTER ================= */
const rest = new REST({ version: "10" }).setToken(TOKEN);
await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

/* ================= READY ================= */
client.once("ready", () =>
  console.log(`🤖 Conectado como ${client.user.tag}`)
);

/* ================= INTERACTIONS ================= */
client.on(Events.InteractionCreate, async i => {
  if (!i.isChatInputCommand()) return;

  const esMod = i.member.roles.cache.has(ROL_MOD_ID);

  /* ---- AYUDA ---- */
  if (i.commandName === "ayuda") {
    return i.reply({
      embeds: [new EmbedBuilder()
        .setTitle("📜 Comandos")
        .setDescription("/info\n/roles\n/ticket\n/policia\n/placa")
        .setColor(0x3498db)],
      ephemeral: true
    });
  }

  /* ---- INFO ---- */
  if (i.commandName === "info") {
    return i.reply({
      embeds: [new EmbedBuilder()
        .setTitle("🇦🇷 Argentina RP")
        .setDescription("Servidor RP serio")
        .setColor(0x2ecc71)],
      ephemeral: true
    });
  }

  /* ---- ROLES ---- */
  if (i.commandName === "roles") {
    return i.reply({
      embeds: [new EmbedBuilder()
        .setTitle("🎭 Roles")
        .setDescription("Civil\nPolicía\nMédico\nADAC\nAbogado\nPolítico")
        .setColor(0x9b59b6)],
      ephemeral: true
    });
  }

  /* ---- TICKET ---- */
  if (i.commandName === "ticket" || i.commandName === "policia") {
    const titulo = i.commandName === "ticket"
      ? "🎫 Soporte"
      : "🚓 Postulación Policía";

    return i.reply({
      embeds: [new EmbedBuilder()
        .setTitle(titulo)
        .setDescription("Abrí un ticket 👇")
        .setColor(0xf1c40f)],
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Abrir Ticket")
          .setStyle(ButtonStyle.Link)
          .setURL(CANAL_TICKETS)
      )],
      ephemeral: true
    });
  }

  /* ---- SERVIDOR ---- */
  if (i.commandName.startsWith("servidor")) {
    if (!esMod) return i.reply({ content: "❌ Sin permisos", ephemeral: true });

    const abierto = i.commandName === "servidor-abrir";
    const embed = new EmbedBuilder()
      .setTitle(abierto ? "🟢 Servidor Abierto" : "🔴 Servidor Cerrado")
      .setColor(abierto ? 0x2ecc71 : 0xe74c3c);

    const log = await client.channels.fetch(CANAL_LOGS);
    log.send({ embeds: [embed] });

    return i.reply({ embeds: [embed] });
  }

  /* ---- PLACA ---- */
  if (i.commandName === "placa") {
    if (db.usuarios[i.user.id])
      return i.reply({ content: "❌ Ya tenés placa", ephemeral: true });

    db.contador++;
    const placa = `P${String(db.contador).padStart(3, "0")}`;
    const nombre = i.options.getString("nombre");
    const rango = i.options.getString("rango");
    const foto = i.options.getAttachment("foto").url;

    db.usuarios[i.user.id] = { nombre, rango, placa, foto };
    guardarDB();

    await i.member.setNickname(`${rango} || ${nombre} #${placa}`).catch(() => {});

    const embed = new EmbedBuilder()
      .setTitle("🪪 Placa asignada")
      .addFields(
        { name: "Usuario", value: `<@${i.user.id}>` },
        { name: "Rango", value: rango },
        { name: "Placa", value: placa }
      )
      .setImage(foto)
      .setColor(0x2ecc71);

    const canal = await client.channels.fetch(CANAL_REGISTRO_PLACAS);
    canal.send({ embeds: [embed] });

    return i.reply({ content: `✅ Placa ${placa} asignada`, ephemeral: true });
  }

  /* ---- VER / BORRAR / LISTA ---- */
  if (!esMod && i.commandName !== "placa")
    return i.reply({ content: "❌ Sin permisos", ephemeral: true });

  if (i.commandName === "ver-placa") {
    const u = i.options.getUser("usuario");
    const d = db.usuarios[u.id];
    if (!d) return i.reply({ content: "❌ No tiene placa", ephemeral: true });

    return i.reply({
      embeds: [new EmbedBuilder()
        .setTitle("🔍 Placa")
        .addFields(
          { name: "Usuario", value: `<@${u.id}>` },
          { name: "Nombre", value: d.nombre },
          { name: "Rango", value: d.rango },
          { name: "Placa", value: d.placa }
        )
        .setColor(0xe67e22)],
      ephemeral: true
    });
  }

  if (i.commandName === "borrar-placa") {
    const u = i.options.getUser("usuario");
    delete db.usuarios[u.id];
    guardarDB();
    return i.reply({ content: "🗑️ Placa borrada", ephemeral: true });
  }

  if (i.commandName === "lista-de-placas") {
    const lista = Object.values(db.usuarios)
      .map(p => `• ${p.placa} | ${p.rango} | ${p.nombre}`)
      .join("\n") || "Sin placas";

    return i.reply({
      embeds: [new EmbedBuilder()
        .setTitle("📋 Lista de Placas")
        .setDescription(lista)
        .setColor(0x95a5a6)],
      ephemeral: true
    });
  }
});

/* ================= LOGIN ================= */
client.login(TOKEN);
