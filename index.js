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
  Events,
  PermissionFlagsBits
} from "discord.js";
import express from "express";

/* ================= HTTP 24/7 ================= */
const app = express();
app.get("/", (req, res) => {
  res.send("Argentina RP Bot activo 24/7");
});
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
  CANAL_SERVER_ACTIVO,
  CANAL_SERVER_CERRADO,
  CANAL_LOGS_SERVER
} = process.env;

const SOPORTE_URL =
  "https://discord.com/channels/1338912774327238778/1338919287842410516";

const LINK_JUEGO =
  "https://www.roblox.com/es/games/7711635737/Emergency-Hamburg?universeId=2992873140";

/* ================= COMANDOS ================= */
const commands = [
  new SlashCommandBuilder().setName("ayuda").setDescription("Muestra los comandos disponibles"),

  new SlashCommandBuilder().setName("info").setDescription("Información del servidor Argentina RP"),

  new SlashCommandBuilder().setName("roles").setDescription("Lista los roles disponibles"),

  new SlashCommandBuilder().setName("ticket").setDescription("Cómo crear un ticket"),

  new SlashCommandBuilder().setName("policia").setDescription("Ingreso a la Policía de Argentina"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Anuncios del servidor")
    .addSubcommand(sub =>
      sub.setName("activo").setDescription("Anunciar servidor activo")
    )
    .addSubcommand(sub =>
      sub.setName("cerrado").setDescription("Anunciar servidor cerrado")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
].map(c => c.toJSON());

/* ================= REGISTRAR SLASH ================= */
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("✅ Comandos registrados correctamente");
})();

/* ================= READY ================= */
client.once("ready", () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

/* ================= INTERACCIONES ================= */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const user = interaction.user;

  /* AYUDA */
  if (interaction.commandName === "ayuda") {
    return interaction.reply({
      content:
        "🧠 **Comandos disponibles**\n\n" +
        "• `/info`\n" +
        "• `/roles`\n" +
        "• `/ticket`\n" +
        "• `/policia`\n" +
        "• `/server activo`\n" +
        "• `/server cerrado`",
      ephemeral: true
    });
  }

  /* INFO */
  if (interaction.commandName === "info") {
    const embed = new EmbedBuilder()
      .setTitle("🇦🇷 Argentina RP")
      .setDescription("Servidor de roleplay serio y activo.")
      .addFields(
        {
          name: "🎭 Roles disponibles",
          value: "• Civil\n• Policía\n• Médico\n• ADAC\n• Abogado/Juez\n• Político"
        },
        { name: "💡 Código del servidor", value: "`zaza1ajv`" }
      )
      .setColor(0x2f80ed);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Soporte")
        .setStyle(ButtonStyle.Link)
        .setURL(SOPORTE_URL)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  /* SERVER */
  if (interaction.commandName === "server") {
    const sub = interaction.options.getSubcommand();

    const canalPublico =
      sub === "activo"
        ? await client.channels.fetch(CANAL_SERVER_ACTIVO)
        : await client.channels.fetch(CANAL_SERVER_CERRADO);

    const canalLogs = await client.channels.fetch(CANAL_LOGS_SERVER);

    if (sub === "activo") {
      await canalPublico.send(
        "**¡Atención, jugadores de Argentina! 🎄🎁 ¡Grandes noticias! La República Argentina va a abrir el servidor para que todos puedan unirse y disfrutar de la mejor experiencia de juego. ¡Prepárense para formar equipos, competir y vivir aventuras épicas juntos!**\n\n" +
        "||@everyone|| 🌟\n\n" +
        "🎮 **Código:** `zaza1ajv`\n" +
        "🔗 " + LINK_JUEGO
      );

      await canalLogs.send(
        `🟢 **Servidor ABIERTO**\n` +
        `👤 Usuario: ${user} (${user.tag})\n` +
        `🕒 Fecha: <t:${Math.floor(Date.now() / 1000)}:F>`
      );

      return interaction.reply({ content: "✅ Servidor anunciado como ACTIVO", ephemeral: true });
    }

    await canalPublico.send(
      "🌙✨ **MUY BUENAS NOCHES, ARGENTINA RP 🇦🇷🔥**\n\n" +
      "El servidor se encuentra **cerrado por hoy** ⛔\n\n" +
      "Gracias a todos por el rol de hoy ❤️\n" +
      "🔔 Mañana volvemos con todo.\n\n" +
      "**¡Buenas noches!** 🌌"
    );

    await canalLogs.send(
      `🔴 **Servidor CERRADO**\n` +
      `👤 Usuario: ${user} (${user.tag})\n` +
      `🕒 Fecha: <t:${Math.floor(Date.now() / 1000)}:F>`
    );

    return interaction.reply({ content: "✅ Servidor anunciado como CERRADO", ephemeral: true });
  }
});

/* ================= LOGIN ================= */
client.login(TOKEN);

