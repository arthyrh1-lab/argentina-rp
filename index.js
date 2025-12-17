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

/* ================= WEB SERVER (RENDER) ================= */
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🤖 Argentina RP Bot activo 24/7");
});

app.listen(PORT, () => {
  console.log("🌐 Web server activo en puerto", PORT);
});

/* ================= CLIENT ================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ================= VARIABLES ENV ================= */
const {
  TOKEN,
  CLIENT_ID,
  GUILD_ID,
  CANAL_SERVER_ABIERTO,
  CANAL_SERVER_CERRADO,
  CANAL_LOGS,
  ROL_MOD,
  CANAL_TICKETS
} = process.env;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("❌ Faltan variables obligatorias");
  process.exit(1);
}

/* ================= COMANDOS ================= */
const commands = [
  new SlashCommandBuilder().setName("ayuda").setDescription("Lista de comandos"),
  new SlashCommandBuilder().setName("info").setDescription("Info del servidor"),
  new SlashCommandBuilder().setName("roles").setDescription("Roles disponibles"),
  new SlashCommandBuilder().setName("ticket").setDescription("Abrir ticket"),
  new SlashCommandBuilder().setName("policia").setDescription("Postularse a policía"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Abrir o cerrar servidor")
    .addStringOption(opt =>
      opt
        .setName("estado")
        .setDescription("Estado del servidor")
        .setRequired(true)
        .addChoices(
          { name: "activo", value: "activo" },
          { name: "cerrado", value: "cerrado" }
        )
    )
].map(c => c.toJSON());

/* ================= REGISTRAR COMANDOS ================= */
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comandos registrados");
  } catch (e) {
    console.error("❌ Error registrando comandos", e);
  }
})();

/* ================= READY ================= */
client.once(Events.ClientReady, () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

/* ================= INTERACCIONES ================= */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  /* ===== AYUDA ===== */
  if (interaction.commandName === "ayuda") {
    const embed = new EmbedBuilder()
      .setTitle("🧠 Comandos disponibles")
      .setDescription(
        "/info\n/roles\n/ticket\n/policia\n/server activo|cerrado"
      )
      .setColor(0x3498db);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /* ===== INFO ===== */
  if (interaction.commandName === "info") {
    const embed = new EmbedBuilder()
      .setTitle("🇦🇷 Argentina RP")
      .setDescription("Servidor de roleplay serio y activo")
      .addFields(
        { name: "💡 Código", value: "`zaza1ajv`" },
        { name: "🎮 Juego", value: "Emergency Hamburg" }
      )
      .setColor(0x2ecc71);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Soporte")
        .setStyle(ButtonStyle.Link)
        .setURL(CANAL_TICKETS)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  /* ===== ROLES ===== */
  if (interaction.commandName === "roles") {
    const embed = new EmbedBuilder()
      .setTitle("🎭 Roles")
      .setDescription("Civil\nPolicía\nMédico\nADAC\nAbogado\nPolítico")
      .setColor(0x9b59b6);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /* ===== TICKET ===== */
  if (interaction.commandName === "ticket") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Soporte")
      .setDescription("Abrí un ticket en el canal correspondiente")
      .setColor(0xf1c40f);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Abrir Ticket")
        .setStyle(ButtonStyle.Link)
        .setURL(CANAL_TICKETS)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  /* ===== POLICIA ===== */
  if (interaction.commandName === "policia") {
    const embed = new EmbedBuilder()
      .setTitle("🚓 Policía Argentina")
      .setDescription("Postulate abriendo un ticket y seleccionando **Ser Policía**")
      .setColor(0xe74c3c);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Postularse")
        .setStyle(ButtonStyle.Link)
        .setURL(CANAL_TICKETS)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  /* ===== SERVER ACTIVO / CERRADO ===== */
  if (interaction.commandName === "server") {
    if (!interaction.member.roles.cache.has(ROL_MOD)) {
      return interaction.reply({ content: "❌ No tenés permiso", ephemeral: true });
    }

    const estado = interaction.options.getString("estado");
    const canalId =
      estado === "activo" ? CANAL_SERVER_ABIERTO : CANAL_SERVER_CERRADO;

    const canal = await client.channels.fetch(canalId);

    const mensajeActivo = `** ¡Atención, jugadores de Argentina! 🎄🎁 ¡Grandes noticias! La República Argentina va a abrir el servidor para que todos puedan unirse y disfrutar de la mejor experiencia de juego. ¡Prepárense para formar equipos, competir y vivir aventuras épicas juntos!**\n\n||@everyone|| 🌟\n\nCódigo: **zaza1ajv**`;

    const mensajeCerrado = `🌙✨ **Buenas noches Argentina RP** 🇦🇷\n\nEl servidor ya se encuentra cerrado por hoy.\nGracias a todos por el rol ❤️\n\nNos vemos mañana 💙`;

    await canal.send(estado === "activo" ? mensajeActivo : mensajeCerrado);

    const log = await client.channels.fetch(CANAL_LOGS);
    await log.send(
      `📢 **Server ${estado.toUpperCase()}**\nEjecutado por: ${interaction.user}`
    );

    return interaction.reply({ content: "✅ Aviso enviado", ephemeral: true });
  }
});

/* ================= LOGIN ================= */
client.login(TOKEN);
