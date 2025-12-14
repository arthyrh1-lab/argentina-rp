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
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const CANAL_SERVER_ACTIVO = process.env.CANAL_SERVER_ACTIVO;
const CANAL_SERVER_CERRADO = process.env.CANAL_SERVER_CERRADO;

const SOPORTE_URL =
  "https://discord.com/channels/1338912774327238778/1338919287842410516";

const LINK_JUEGO =
  "https://www.roblox.com/es/games/7711635737/Emergency-Hamburg?universeId=2992873140";

/* ================= COMANDOS ================= */
const commands = [
  new SlashCommandBuilder()
    .setName("ayuda")
    .setDescription("Muestra los comandos disponibles"),

  new SlashCommandBuilder()
    .setName("info")
    .setDescription("Información del servidor Argentina RP"),

  new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Lista los roles disponibles"),

  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Cómo crear un ticket"),

  new SlashCommandBuilder()
    .setName("policia")
    .setDescription("Ingreso a la Policía de Argentina"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Anuncios del servidor")
    .addSubcommand(sub =>
      sub
        .setName("activo")
        .setDescription("Anunciar servidor activo")
    )
    .addSubcommand(sub =>
      sub
        .setName("cerrado")
        .setDescription("Anunciar servidor cerrado")
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
  console.log("✅ Comandos registrados");
})();

/* ================= READY ================= */
client.once("ready", () => {
  console.log(`🤖 Conectado como ${client.user.tag}`);
});

/* ================= INTERACCIONES ================= */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  /* ---- AYUDA ---- */
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

  /* ---- INFO ---- */
  if (interaction.commandName === "info") {
    const embed = new EmbedBuilder()
      .setTitle("🇦🇷 Argentina RP")
      .setDescription("Servidor de roleplay serio.\n¡Bienvenido/a!")
      .addFields(
        {
          name: "🎭 Roles disponibles",
          value:
            "• Civil\n• Policía\n• Médico\n• ADAC\n• Abogado/Juez\n• Político"
        },
        { name: "💡 Código del servidor", value: "`zaza1ajv`" },
        {
          name: "✨ Extras",
          value: "• Staff activo\n• Eventos\n• Bandas"
        }
      )
      .setColor(0x2f80ed)
      .setFooter({ text: "Argentina RP" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Soporte")
        .setStyle(ButtonStyle.Link)
        .setURL(SOPORTE_URL)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }

  /* ---- ROLES ---- */
  if (interaction.commandName === "roles") {
    return interaction.reply({
      content:
        "🎭 **Roles disponibles**\n• Civil\n• Policía\n• Médico\n• ADAC\n• Abogado/Juez\n• Político",
      ephemeral: true
    });
  }

  /* ---- TICKET ---- */
  if (interaction.commandName === "ticket") {
    return interaction.reply({
      content:
        "🎫 **Sistema de Tickets**\n\nAbrí un ticket en:\n" + SOPORTE_URL,
      ephemeral: true
    });
  }

  /* ---- POLICIA ---- */
  if (interaction.commandName === "policia") {
    return interaction.reply({
      content:
        "🚓 **Ingreso a Policía**\n\n" +
        "• Buen rol civil\n" +
        "• Sin sanciones\n" +
        "• DNI y licencia activa\n\n" +
        "Abrí ticket en:\n" +
        SOPORTE_URL,
      ephemeral: true
    });
  }

  /* ---- SERVER ---- */
  if (interaction.commandName === "server") {
    const canalId =
      interaction.options.getSubcommand() === "activo"
        ? CANAL_SERVER_ACTIVO
        : CANAL_SERVER_CERRADO;

    const channel = await client.channels.fetch(canalId);

    if (interaction.options.getSubcommand() === "activo") {
      await channel.send(
        `**¡Atención, jugadores de Argentina! 🎄🎁 ¡Grandes noticias! La República Argentina va a abrir el servidor para que todos puedan unirse y disfrutar de la mejor experiencia de juego. ¡Prepárense para formar equipos, competir y vivir aventuras épicas juntos! No importa si eres un jugador novato o un experto, ¡todos son bienvenidos! Así que ajusta tus controles, invita a tus amigos y ¡vamos a jugar! 🎆🥂**\n\n` +
        `||@everyone|| 🌟\n\n` +
        `🎮 **Código del servidor:** \`zaza1ajv\`\n` +
        `🔗 ${LINK_JUEGO}`
      );

      return interaction.reply({
        content: "✅ Anuncio de servidor activo enviado",
        ephemeral: true
      });
    }

    await channel.send(
      "🌙 **Buenas noches Argentina RP**\n\n" +
      "El servidor cerró por hoy.\n" +
      "Nos vemos mañana para seguir roleando 💙"
    );

    return interaction.reply({
      content: "✅ Anuncio de servidor cerrado enviado",
      ephemeral: true
    });
  }
});

/* ================= LOGIN ================= */
client.login(TOKEN);
