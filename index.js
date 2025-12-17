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

/* 🔗 CANAL DE TICKETS (FIJO) */
const CANAL_TICKETS =
  "https://discord.com/channels/1338912774327238778/1338919287842410516";

/* ================= COMANDOS ================= */
const commands = [
  new SlashCommandBuilder().setName("ayuda").setDescription("Muestra los comandos disponibles"),
  new SlashCommandBuilder().setName("info").setDescription("Información del servidor"),
  new SlashCommandBuilder().setName("roles").setDescription("Roles disponibles"),
  new SlashCommandBuilder().setName("ticket").setDescription("Abrir ticket de soporte"),
  new SlashCommandBuilder().setName("policia").setDescription("Postularse a Policía")
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

  /* ---- AYUDA ---- */
  if (interaction.commandName === "ayuda") {
    const embed = new EmbedBuilder()
      .setTitle("🧠 Comandos disponibles")
      .setDescription(
        "• `/info`\n" +
        "• `/roles`\n" +
        "• `/ticket`\n" +
        "• `/policia`"
      )
      .setColor(0x3498db);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /* ---- INFO ---- */
  if (interaction.commandName === "info") {
    const embed = new EmbedBuilder()
      .setTitle("🇦🇷 Argentina RP")
      .setDescription("Servidor de roleplay serio y divertido.\n\n¡Bienvenido/a!")
      .addFields(
        {
          name: "🎭 Roles disponibles",
          value: "Civil\nPolicía\nMédico\nADAC\nAbogado/Juez\nPolítico"
        },
        {
          name: "💡 Código del servidor",
          value: "`zaza1ajv`"
        }
      )
      .setColor(0x2ecc71)
      .setFooter({ text: "Argentina RP" });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /* ---- ROLES ---- */
  if (interaction.commandName === "roles") {
    const embed = new EmbedBuilder()
      .setTitle("🎭 Roles disponibles")
      .setDescription(
        "• Civil\n" +
        "• Policía\n" +
        "• Médico\n" +
        "• ADAC\n" +
        "• Abogado/Juez\n" +
        "• Político"
      )
      .setColor(0x9b59b6);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /* ---- TICKET ---- */
  if (interaction.commandName === "ticket") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Soporte General")
      .setDescription(
        "¿Necesitás ayuda del staff?\n\n" +
        "Abrí un ticket haciendo clic en el botón de abajo 👇"
      )
      .setColor(0xf1c40f)
      .setFooter({ text: "Argentina RP" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Abrir Ticket")
        .setStyle(ButtonStyle.Link)
        .setURL(CANAL_TICKETS)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }

  /* ---- POLICIA ---- */
  if (interaction.commandName === "policia") {
    const embed = new EmbedBuilder()
      .setTitle("🚓 Postulación – Policía de Argentina")
      .setDescription(
        "Requisitos para postularte:\n\n" +
        "• Buen rol civil\n" +
        "• Sin sanciones activas\n" +
        "• DNI y licencia activa\n\n" +
        "Para postularte abrí un ticket y seleccioná **Ser Policía**."
      )
      .setColor(0xe74c3c)
      .setFooter({ text: "Argentina RP" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Postularse – Ser Policía")
        .setStyle(ButtonStyle.Link)
        .setURL(CANAL_TICKETS)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
});

/* ================= LOGIN ================= */
client.login(TOKEN);
