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
app.get("/", (req, res) => res.send("Argentina RP Bot 24/7 activo"));
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
    .setDescription("Estado del servidor")
    .addSubcommand(s => s.setName("activo").setDescription("Anunciar servidor activo"))
    .addSubcommand(s => s.setName("cerrado").setDescription("Anunciar servidor cerrado"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
].map(c => c.toJSON());

/* ================= REGISTRAR COMANDOS ================= */
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

  const user = interaction.user;

  /* ================= AYUDA ================= */
  if (interaction.commandName === "ayuda") {
    const embed = new EmbedBuilder()
      .setTitle("🧠 Ayuda | Argentina RP")
      .setDescription("Estos son los comandos disponibles:")
      .addFields(
        { name: "/info", value: "Información del servidor" },
        { name: "/roles", value: "Roles disponibles" },
        { name: "/ticket", value: "Contactar al staff" },
        { name: "/policia", value: "Ingreso a la policía" },
        { name: "/server activo", value: "Anunciar servidor activo (staff)" },
        { name: "/server cerrado", value: "Anunciar servidor cerrado (staff)" }
      )
      .setColor(0x3498db);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /* ================= INFO ================= */
  if (interaction.commandName === "info") {
    const embed = new EmbedBuilder()
      .setTitle("🇦🇷 Argentina RP")
      .setDescription("Servidor de roleplay serio, activo y organizado.")
      .addFields(
        {
          name: "🎭 Roles",
          value: "Civil\nPolicía\nMédico\nADAC\nAbogado/Juez\nPolítico"
        },
        { name: "🎮 Código", value: "`zaza1ajv`" }
      )
      .setColor(0x2ecc71);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Soporte")
        .setStyle(ButtonStyle.Link)
        .setURL(SOPORTE_URL)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  /* ================= ROLES ================= */
  if (interaction.commandName === "roles") {
    const embed = new EmbedBuilder()
      .setTitle("🎭 Roles Disponibles")
      .setDescription(
        "• Civil\n• Policía\n• Médico\n• ADAC\n• Abogado/Juez\n• Político"
      )
      .setColor(0xf1c40f);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /* ================= TICKET ================= */
  if (interaction.commandName === "ticket") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Sistema de Tickets")
      .setDescription(
        "Para comunicarte con el staff abrí un ticket en el canal correspondiente."
      )
      .setColor(0xe67e22);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /* ================= POLICIA ================= */
  if (interaction.commandName === "policia") {
    const embed = new EmbedBuilder()
      .setTitle("🚓 Ingreso a la Policía")
      .setDescription(
        "• Buen rol civil\n• Sin sanciones\n• DNI y licencia activa\n• Crear ticket Policía"
      )
      .setColor(0xe74c3c);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /* ================= SERVER ================= */
  if (interaction.commandName === "server") {
    const sub = interaction.options.getSubcommand();
    const canalLogs = await client.channels.fetch(CANAL_LOGS_SERVER);

    if (sub === "activo") {
      const canal = await client.channels.fetch(CANAL_SERVER_ACTIVO);

      await canal.send(
        "**¡Atención, jugadores de Argentina! 🎄🎁 ¡Grandes noticias!**\n\n" +
        "El servidor está **ABIERTO** para todos.\n\n" +
        "||@everyone|| 🌟\n\n" +
        "🎮 Código: `zaza1ajv`\n" +
        "🔗 " + LINK_JUEGO
      );

      await canalLogs.send(
        `🟢 Servidor ABIERTO\n👤 ${user.tag}\n🕒 <t:${Math.floor(Date.now()/1000)}:F>`
      );

      return interaction.reply({ content: "✅ Servidor anunciado como ACTIVO", ephemeral: true });
    }

    const canal = await client.channels.fetch(CANAL_SERVER_CERRADO);

    await canal.send(
      "🌙✨ **Buenas noches Argentina RP**\n\n" +
      "El servidor ya se encuentra **cerrado por hoy** ⛔\n\n" +
      "Gracias por el rol ❤️\nNos vemos mañana 🇦🇷"
    );

    await canalLogs.send(
      `🔴 Servidor CERRADO\n👤 ${user.tag}\n🕒 <t:${Math.floor(Date.now()/1000)}:F>`
    );

    return interaction.reply({ content: "✅ Servidor anunciado como CERRADO", ephemeral: true });
  }
});

/* ================= LOGIN ================= */
client.login(TOKEN);
