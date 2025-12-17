import express from "express";
import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  Events,
  PermissionFlagsBits
} from "discord.js";

/* ================= WEB SERVER (RENDER) ================= */
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.send("Argentina RP Bot activo 24/7");
});

app.listen(PORT, () => {
  console.log("🌐 Web server activo en puerto", PORT);
});

/* ================= CLIENTE DISCORD ================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ================= VARIABLES ================= */
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const ROLE_MOD = process.env.ROLE_MOD; // ID rol staff/mod
const CHANNEL_ABIERTO = process.env.CHANNEL_ABIERTO;
const CHANNEL_CERRADO = process.env.CHANNEL_CERRADO;
const CHANNEL_LOGS = process.env.CHANNEL_LOGS;
const CHANNEL_PLACAS = process.env.CHANNEL_PLACAS;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("❌ FALTAN VARIABLES DE ENTORNO");
  process.exit(1);
}

/* ================= BASE DE DATOS SIMPLE ================= */
const placas = new Map();
let contadorPlaca = 1;

/* ================= COMANDOS ================= */
const commands = [
  new SlashCommandBuilder().setName("ayuda").setDescription("Ver comandos"),
  new SlashCommandBuilder().setName("info").setDescription("Info del servidor"),
  new SlashCommandBuilder().setName("roles").setDescription("Roles disponibles"),
  new SlashCommandBuilder().setName("ticket").setDescription("Soporte"),
  new SlashCommandBuilder().setName("policia").setDescription("Ingreso policía"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Abrir o cerrar servidor")
    .addStringOption(o =>
      o.setName("estado")
        .setDescription("activo o cerrado")
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
    .addStringOption(o => o.setName("rango").setRequired(true)),

  new SlashCommandBuilder()
    .setName("ver-placa")
    .setDescription("Ver placa de un usuario")
    .addUserOption(o => o.setName("usuario").setRequired(true)),

  new SlashCommandBuilder()
    .setName("borrar-placa")
    .setDescription("Borrar placa")
    .addUserOption(o => o.setName("usuario").setRequired(true))
].map(c => c.toJSON());

/* ================= REGISTRAR COMANDOS ================= */
const rest = new REST({ version: "10" }).setToken(TOKEN);
await rest.put(
  Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
  { body: commands }
);

/* ================= READY ================= */
client.once(Events.ClientReady, () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

/* ================= INTERACCIONES ================= */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, guild, user } = interaction;

  /* ========== CHECK MOD ========== */
  const esMod = ROLE_MOD
    ? interaction.member.roles.cache.has(ROLE_MOD)
    : interaction.member.permissions.has(PermissionFlagsBits.Administrator);

  /* ---------- AYUDA ---------- */
  if (commandName === "ayuda") {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📘 Comandos")
          .setDescription(
            "/info\n/roles\n/ticket\n/policia\n/server\n/placa\n/ver-placa"
          )
          .setColor(0x2ecc71)
      ],
      ephemeral: true
    });
  }

  /* ---------- SERVER ---------- */
  if (commandName === "server") {
    if (!esMod)
      return interaction.reply({ content: "❌ Sin permisos", ephemeral: true });

    const estado = interaction.options.getString("estado");
    const canal =
      estado === "activo"
        ? await guild.channels.fetch(CHANNEL_ABIERTO)
        : await guild.channels.fetch(CHANNEL_CERRADO);

    if (!canal)
      return interaction.reply({ content: "❌ Canal no encontrado", ephemeral: true });

    const mensaje =
      estado === "activo"
        ? `**¡Atención jugadores!**\n\nServidor **ABIERTO** 🎉\nCódigo: **zaza1ajv**\n\n||@everyone||`
        : `🌙 Buenas noches Argentina RP 🇦🇷\nServidor cerrado por hoy.\nGracias a todos ❤️`;

    await canal.send(mensaje);
    await guild.channels.fetch(CHANNEL_LOGS)
      ?.then(c => c.send(`📝 ${user.tag} cambió estado a **${estado}**`));

    return interaction.reply({ content: "✅ Listo", ephemeral: true });
  }

  /* ---------- PLACA ---------- */
  if (commandName === "placa") {
    const nombre = interaction.options.getString("nombre");
    const rango = interaction.options.getString("rango");

    const placa = `P${String(contadorPlaca).padStart(3, "0")}`;
    contadorPlaca++;

    placas.set(user.id, { nombre, rango, placa });

    await interaction.member.setNickname(`${rango} || ${nombre} #${placa}`);

    await guild.channels.fetch(CHANNEL_PLACAS)
      ?.then(c =>
        c.send(
          `📋 **Nueva placa**\nUsuario: ${user}\nRango: ${rango}\nPlaca: ${placa}`
        )
      );

    return interaction.reply({
      content: `✅ Placa asignada: **${placa}**`,
      ephemeral: true
    });
  }

  /* ---------- VER PLACA ---------- */
  if (commandName === "ver-placa") {
    if (!esMod)
      return interaction.reply({ content: "❌ Sin permisos", ephemeral: true });

    const u = interaction.options.getUser("usuario");
    const data = placas.get(u.id);

    if (!data)
      return interaction.reply({ content: "❌ Sin placa", ephemeral: true });

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🪪 Placa")
          .addFields(
            { name: "Usuario", value: `${u}` },
            { name: "Nombre", value: data.nombre },
            { name: "Rango", value: data.rango },
            { name: "Placa", value: data.placa }
          )
          .setColor(0x3498db)
      ],
      ephemeral: true
    });
  }

  /* ---------- BORRAR PLACA ---------- */
  if (commandName === "borrar-placa") {
    if (!esMod)
      return interaction.reply({ content: "❌ Sin permisos", ephemeral: true });

    const u = interaction.options.getUser("usuario");
    placas.delete(u.id);
    return interaction.reply({ content: "🗑️ Placa eliminada", ephemeral: true });
  }
});

/* ================= LOGIN ================= */
client.login(TOKEN);
