import express from "express";
import {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} from "discord.js";

/* ================= WEB SERVER ================= */
const app = express();
app.get("/", (_, res) => res.send("Argentina RP Bot activo"));
app.listen(process.env.PORT || 3000);

/* ================= CLIENT ================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

/* ================= ENV ================= */
const {
  TOKEN,
  CLIENT_ID,
  GUILD_ID,
  ROL_MOD,
  CANAL_TICKETS,
  CANAL_SERVER_ABIERTO,
  CANAL_SERVER_CERRADO,
  CANAL_LOGS,
  CANAL_PLACAS
} = process.env;

/* ================= PLACAS (MEMORIA) ================= */
let contadorPlacas = 1;
const placas = new Map();

/* ================= COMANDOS ================= */
const commands = [
  new SlashCommandBuilder().setName("ayuda").setDescription("Comandos"),
  new SlashCommandBuilder().setName("info").setDescription("Info servidor"),
  new SlashCommandBuilder().setName("roles").setDescription("Roles"),
  new SlashCommandBuilder().setName("ticket").setDescription("Soporte"),
  new SlashCommandBuilder().setName("policia").setDescription("Postularse policía"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Abrir o cerrar servidor")
    .addStringOption(o =>
      o.setName("estado")
        .setRequired(true)
        .addChoices(
          { name: "activo", value: "activo" },
          { name: "cerrado", value: "cerrado" }
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
    .setDescription("Ver placa de un usuario")
    .addUserOption(o => o.setName("usuario").setRequired(true)),

  new SlashCommandBuilder()
    .setName("borrar-placa")
    .setDescription("Borrar placa")
    .addUserOption(o => o.setName("usuario").setRequired(true)),

  new SlashCommandBuilder()
    .setName("lista-de-placas")
    .setDescription("Lista de placas")
].map(c => c.toJSON());

/* ================= REGISTRAR ================= */
const rest = new REST({ version: "10" }).setToken(TOKEN);
await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

/* ================= READY ================= */
client.once(Events.ClientReady, () => {
  console.log("Bot listo:", client.user.tag);
});

/* ================= INTERACTIONS ================= */
client.on(Events.InteractionCreate, async i => {
  if (!i.isChatInputCommand()) return;

  const esMod =
    i.member.permissions.has(PermissionFlagsBits.Administrator) ||
    i.member.roles.cache.has(ROL_MOD);

  /* ===== SERVER ===== */
  if (i.commandName === "server") {
    if (!esMod) return i.reply({ content: "❌ Sin permiso", ephemeral: true });

    const estado = i.options.getString("estado");
    const canal = await client.channels.fetch(
      estado === "activo" ? CANAL_SERVER_ABIERTO : CANAL_SERVER_CERRADO
    );

    const msgActivo = `** ¡Atención, jugadores de Argentina! 🎄🎁 ¡Grandes noticias! La República Argentina va a abrir el servidor!**\n\n||@everyone|| 🌟\n\nCódigo: **zaza1ajv**`;
    const msgCerrado = `🌙✨ Buenas noches Argentina RP 🇦🇷\nServidor cerrado por hoy.\nNos vemos mañana 💙`;

    await canal.send(estado === "activo" ? msgActivo : msgCerrado);

    const log = await client.channels.fetch(CANAL_LOGS);
    await log.send(`📢 Server ${estado} por ${i.user}`);

    return i.reply({ content: "✅ Aviso enviado", ephemeral: true });
  }

  /* ===== PLACA ===== */
  if (i.commandName === "placa") {
    const nombre = i.options.getString("nombre");
    const rango = i.options.getString("rango");
    const foto = i.options.getAttachment("foto");

    const placaId = `P${String(contadorPlacas).padStart(3, "0")}`;
    contadorPlacas++;

    placas.set(i.user.id, { nombre, rango, placaId, foto: foto.url });

    await i.member.setNickname(`${rango} || ${nombre} #${placaId}`);

    const canal = await client.channels.fetch(CANAL_PLACAS);
    const embed = new EmbedBuilder()
      .setTitle("📋 Placa asignada")
      .addFields(
        { name: "Usuario", value: `${i.user}` },
        { name: "Nombre", value: nombre },
        { name: "Rango", value: rango },
        { name: "Placa", value: placaId }
      )
      .setImage(foto.url)
      .setColor(0x3498db);

    await canal.send({ embeds: [embed] });
    return i.reply({ content: "✅ Placa registrada", ephemeral: true });
  }

  /* ===== VER PLACA ===== */
  if (i.commandName === "ver-placa") {
    if (!esMod) return i.reply({ content: "❌ Sin permiso", ephemeral: true });

    const u = i.options.getUser("usuario");
    const p = placas.get(u.id);
    if (!p) return i.reply({ content: "❌ No tiene placa", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle("🔎 Placa")
      .addFields(
        { name: "Usuario", value: `${u}` },
        { name: "Nombre", value: p.nombre },
        { name: "Rango", value: p.rango },
        { name: "Placa", value: p.placaId }
      )
      .setImage(p.foto);

    return i.reply({ embeds: [embed], ephemeral: true });
  }

  /* ===== BORRAR ===== */
  if (i.commandName === "borrar-placa") {
    if (!esMod) return i.reply({ content: "❌ Sin permiso", ephemeral: true });

    const u = i.options.getUser("usuario");
    placas.delete(u.id);
    return i.reply({ content: "🗑️ Placa borrada", ephemeral: true });
  }

  /* ===== LISTA ===== */
  if (i.commandName === "lista-de-placas") {
    if (!esMod) return i.reply({ content: "❌ Sin permiso", ephemeral: true });

    const lista = [...placas.entries()]
      .map(([_, p]) => `${p.placaId} - ${p.nombre} (${p.rango})`)
      .join("\n") || "Sin placas";

    return i.reply({ content: "📄 **Placas:**\n" + lista, ephemeral: true });
  }
});

client.login(TOKEN);
