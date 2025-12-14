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

const SOPORTE_URL =
  "https://discord.com/channels/1338912774327238778/1338919287842410516";

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
    .setDescription("Ingreso a la Policía de Argentina")
].map(c => c.toJSON());

/* ================= REGISTRAR / ================= */
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
        "• `/info` → Información del servidor\n" +
        "• `/roles` → Lista de roles disponibles\n" +
        "• `/ticket` → Cómo crear un ticket\n" +
        "• `/policia` → Ingreso a la Policía de Argentina",
      ephemeral: true
    });
  }

  /* ---- INFO ---- */
  if (interaction.commandName === "info") {
    const embed = new EmbedBuilder()
      .setTitle("🇦🇷 Argentina RP")
      .setDescription(
        "Servidor de roleplay serio y divertido.\n\n**¡Bienvenido/a!**"
      )
      .addFields(
        {
          name: "🎭 Roles disponibles",
          value:
            "• Civil\n• Policía\n• Médico\n• ADAC\n• Abogado/Juez\n• Político"
        },
        {
          name: "🛠️ Contactar al Staff",
          value:
            "Haz clic en el botón de abajo para abrir un ticket de soporte general."
        },
        {
          name: "💡 Código del servidor",
          value: "`zaza1ajv`"
        },
        {
          name: "✨ Extras",
          value:
            "• Staff activo\n• Eventos y bandas\n• Bienvenidos nuevos jugadores"
        }
      )
      .setColor(0x2f80ed)
      .setFooter({ text: "Argentina RP" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Soporte General")
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
        "🎭 **Roles disponibles**\n\n" +
        "• Civil\n• Policía\n• Médico\n• ADAC\n• Abogado/Juez\n• Político",
      ephemeral: true
    });
  }

  /* ---- TICKET ---- */
  if (interaction.commandName === "ticket") {
    return interaction.reply({
      content:
        "🎫 **Sistema de Tickets**\n\n" +
        "Para comunicarte con el staff ingresá al canal de tickets y seleccioná **Soporte General**:\n\n" +
        SOPORTE_URL,
      ephemeral: true
    });
  }

  /* ---- POLICIA ---- */
  if (interaction.commandName === "policia") {
    const embed = new EmbedBuilder()
      .setTitle("🚓 Ingreso a Policía de Argentina")
      .setDescription(
        "• Buen rol civil\n" +
        "• Sin sanciones activas\n" +
        "• Crear ticket de **Ser Policía**\n" +
        "• Completar el formulario correspondiente\n" +
        "• Tener **DNI y licencia activa**"
      )
      .setColor(0xe74c3c)
      .setFooter({ text: "Argentina RP" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Abrir Ticket Policía")
        .setStyle(ButtonStyle.Link)
        .setURL(SOPORTE_URL)
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
