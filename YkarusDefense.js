const { hostname } = require("os");
const { appendFileSync } = require("fs");
const path = require("path");
const cron = require("node-cron");
const fetch = require("node-fetch");  // Certifique-se de instalar o node-fetch (se necessário)
const screenshot = require("screenshot-desktop");

const FormData = require("form-data");
const psList = require("ps-list");
const webhook = "<webhook here>";


async function picture() {
    try {
        const pic = await screenshot();
    
        return pic;
    } catch (err) {
        log("Picture -> ", err)
    }
}

function formData(imgBuffer) {
    try {
        const form = new FormData();
        form.append('file', imgBuffer, {filename:"screenshot.png"});
        form.append('payload_json', JSON.stringify({
            content: "📸 Captura de tela!"
        }));


        return form;
    } catch (error) {
        log("Send Buffer  -> " + error)
    }
}

function log(message) {
    const __logpath = path.join(process.cwd(), "logs.txt");
    const now = new Date();
    const timestamp = now.getTime();
    const logMessage = `[${new Date(timestamp).toLocaleString()}] - ${message} \n`;

    appendFileSync(__logpath, logMessage, "utf-8");
}

log("Ykarus defense started...");

async function send_alert(data, headers) {
    try {
        await fetch(webhook, {
            headers: headers,
            method: "POST",
            body: data
        });
    } catch (err) {
        log(`Request Error - ${err}`);
    }
}

async function getIp() {
    try {
        const response = await fetch("http://api.ipify.org", {
            headers: { "Content-Type": "application/json" },
        });

        const responseText = await response.text();
        return responseText;
    } catch (err) {
        log(`Request Error - ${err}`);
    }
}

async function getActivitys() {
    try {
        // Usando ps-list como alternativa ao tasklist
        const tasks = await psList();
        return  tasks;
    } catch (err) {
        log(`Get activitys - ${err}`);
    }
}

async function main() {
    const now = new Date();
    const timestamp = now.getTime();
    const externalIp = await getIp();
    const bufferImage = await picture();
    const data = {
        content: "🚨 **Alerta:** PC foi ligado!",
        embeds: [
            {
                title: `🖥️ PC CONECTADO`,
                color: 3447003,
                fields: [
                    { name: "🕒 Horário", value: `${new Date(timestamp).toLocaleString()}`, inline: false },
                    { name: "💻 Nome do Computador", value: `\`${hostname()}\``, inline: false },
                    { name: "🔹 Status", value: "✅ **Ativo**", inline: false },
                    { name: "🔹 IP Publíco", value: `**${externalIp}**`, inline: false }
                ],
                footer: { text: "🔹 Monitoramento Automático", icon_url: "https://cdn-icons-png.flaticon.com/512/1828/1828640.png" },
                timestamp: new Date().toISOString()
            },
            {
                title: "📌 Processos Ativos",
                color: 15158332,
                description: "Lista de processos em execução no momento:\n```markdown\n(Pode ser preenchido com processos reais)\n```",
                footer: { text: "📡 Sistema de Monitoramento By Ykarus" }
            }
        ]
    };
    const form = formData(bufferImage);

    const systemProcesses = ['System Idle Process', 'System', 'Registry', 'smss.exe', 'csrss.exe', 'wininit.exe', 'services.exe', 'lsass.exe', 'svchost.exe', 'winlogon.exe', 'explorer.exe', "RuntimeBroker.exe", "conhost.exe", "dllhost.exe", "Secure System",  "LsaIso.exe",
        "fontdrvhost.exe",
        "NVDisplay.Container.exe",
        "Memory Compression",
        "spoolsv.exe",
        "sqlwriter.exe",
        "jhi_service.exe",
        "WMIRegistrationService.exe",
        "MsMpEng.exe",
        "MpDefenderCoreService.exe",
        "logi_lamparray_service.exe",
        "AggregatorHost.exe",
        "NgcIso.exe",
        "NisSrv.exe",
        "SecurityHealthService.exe",
        "SearchIndexer.exe",
        "gamingservices.exe",
        "gamingservicesnet.exe",
        "RuntimeBroker.exe",
        "conhost.exe",
        "dllhost.exe",
        "Secure System",
        "sihost.exe",
        "taskhostw.exe",
        "ShellHost.exe",
        "SearchHost.exe",
        "StartMenuExperienceHost.exe",
        "Widgets.exe",
        "WidgetService.exe",
        "UserOOBEBroker.exe",
        "ctfmon.exe",
        "LockApp.exe",
        "SecurityHealthSystray.exe",
        "TextInputHost.exe",
        "CrossDeviceService.exe",
        "XboxPcTray.exe",
        "XboxPcAppFT.exe",
        "ApplicationFrameHost.exe",
        "XboxPcApp.exe",
        "SystemSettings.exe",
        "smartscreen.exe",
        "FileCoAuth.exe",
        "cmd.exe",
        "OpenConsole.exe",
        "WindowsTerminal.exe",
        "msedgewebview2.exe",
        "Taskmgr.exe",
        "WmiPrvSE.exe",
        "SearchProtocolHost.exe",
        "SearchFilterHost.exe",
        "audiodg.exe"];


    try {
        const tasks = await getActivitys();
        let strs = "";
        if(tasks)
        {
            tasks.filter(task => !systemProcesses.includes(task.name))
            .forEach(task => {
                strs += `Nome: ${task.name} PID: ${task.pid}\n`;
            });
            data.embeds[1].description = strs;
        } else {
            data.embeds[1].description = "Não foi possível obter os processos ativos";
        }
        await send_alert(JSON.stringify(data), { "Content-Type": "application/json" });
        await send_alert(form, form.getHeaders());


    } catch (err) {
        log(`Main -> ${err}`);

    }
}

process.title = "YkarusDefense";


main();
cron.schedule("*/20 * * * *", () => {
    main();
});


