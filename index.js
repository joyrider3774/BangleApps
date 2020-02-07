var appJSON = []; // List of apps and info from apps.json
var appsInstalled = []; // list of app JSON
var files = []; // list of files on Bangle

httpGet("apps.json").then(apps=>{
  try {
    appJSON = JSON.parse(apps);
  } catch(e) {
    console.log(e);
    showToast("App List Corrupted","error");
  }
  appJSON.sort(appSorter);
  refreshLibrary();
});

// Status
// ===========================================  Top Navigation
function showToast(message, type) {
  // toast-primary, toast-success, toast-warning or toast-error
  var style = "toast-primary";
  if (type=="success")  style = "toast-success";
  else if (type=="error")  style = "toast-error";
  else if (type!==undefined) console.log("showToast: unknown toast "+type);
  var toastcontainer = document.getElementById("toastcontainer");
  var msgDiv = htmlElement(`<div class="toast ${style}"></div>`);
  msgDiv.innerHTML = message;
  toastcontainer.append(msgDiv);
  setTimeout(function() {
    msgDiv.remove();
  }, 5000);
}
var progressToast;
Puck.writeProgress = function(charsSent, charsTotal) {
  if (charsSent===undefined) {
    if (progressToast) progressToast.remove();
    progressToast = undefined;
    return;
  }
  var percent = Math.round(charsSent*100/charsTotal);
  if (!progressToast) {
    var toastcontainer = document.getElementById("toastcontainer");
    progressToast = htmlElement(`<div class="toast">
    <div class="bar bar-sm">
      <div class="bar-item" id="progressToast" role="progressbar" style="width:${percent}%;" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
  </div>`);
    toastcontainer.append(progressToast);
  } else {
    var pt=document.getElementById("progressToast");
    pt.setAttribute("aria-valuenow",percent);
    pt.style.width = percent+"%";
  }
}
function showPrompt(title, text) {
  return new Promise((resolve,reject) => {
    var modal = htmlElement(`<div class="modal active">
      <!--<a href="#close" class="modal-overlay" aria-label="Close"></a>-->
      <div class="modal-container">
        <div class="modal-header">
          <a href="#close" class="btn btn-clear float-right" aria-label="Close"></a>
          <div class="modal-title h5">${escapeHtml(title)}</div>
        </div>
        <div class="modal-body">
          <div class="content">
            ${escapeHtml(text)}
          </div>
        </div>
        <div class="modal-footer">
          <div class="modal-footer">
            <button class="btn btn-primary" isyes="1">Yes</button>
            <button class="btn" isyes="0">No</button>
          </div>
        </div>
      </div>
    </div>`);
    document.body.append(modal);
    htmlToArray(modal.getElementsByTagName("button")).forEach(button => {
      button.addEventListener("click",event => {
        event.preventDefault();
        var isYes = event.target.getAttribute("isyes")=="1";
        if (isYes) resolve();
        else reject();
        modal.remove();
      });
    });
  });
}
function handleCustomApp(app) {
  return new Promise((resolve,reject) => {
    var modal = htmlElement(`<div class="modal active">
      <a href="#close" class="modal-overlay " aria-label="Close"></a>
      <div class="modal-container" style="height:100%">
        <div class="modal-header">
          <a href="#close" class="btn btn-clear float-right" aria-label="Close"></a>
          <div class="modal-title h5">${escapeHtml(app.name)}</div>
        </div>
        <div class="modal-body" style="height:100%">
          <div class="content" style="height:100%">
            <iframe src="apps/${app.id}/${app.custom}" style="width:100%;height:100%;border:0px;">
          </div>
        </div>
      </div>
    </div>`);
    document.body.append(modal);
    htmlToArray(modal.getElementsByTagName("a")).forEach(button => {
      button.addEventListener("click",event => {
        event.preventDefault();
        modal.remove();
        reject("Window closed");
      });
    });

    var iframe = modal.getElementsByTagName("iframe")[0];
    iframe.contentWindow.addEventListener("message", function(event) {
      var app = event.data;
      console.log("Received custom app", app);
      modal.remove();
      Comms.uploadApp(app).then(resolve,reject);
    }, false);
  });
}
// ===========================================  Top Navigation
function showTab(tabname) {
  htmlToArray(document.querySelectorAll("#tab-navigate .tab-item")).forEach(tab => {
    tab.classList.remove("active");
  });
  htmlToArray(document.querySelectorAll(".bangle-tab")).forEach(tab => {
    tab.style.display = "none";
  });
  document.getElementById("tab-"+tabname).classList.add("active");
  document.getElementById(tabname).style.display = "inherit";
}

// =========================================== Library

var activeFilter = '';
var currentSearch = '';

function refreshLibrary() {
  var panelbody = document.querySelector("#librarycontainer .panel-body");
  var visibleApps = appJSON;

  if (activeFilter) {
    visibleApps = visibleApps.filter(app => app.tags && app.tags.split(',').includes(activeFilter));
  }

  if (currentSearch) {
    visibleApps = visibleApps.filter(app => app.name.toLowerCase().includes(currentSearch) || app.tags.includes(currentSearch));
  }

  panelbody.innerHTML = visibleApps.map((app,idx) => {
    var appInstalled = appsInstalled.find(a=>a.id==app.id);
    var version = getVersionInfo(app, appInstalled);
    var versionInfo = version.text;
    if (versionInfo) versionInfo = " <small>("+versionInfo+")</small>";
    return `<div class="tile column col-6 col-sm-12 col-xs-12">
    <div class="tile-icon">
      <figure class="avatar"><img src="apps/${app.icon?`${app.id}/${app.icon}`:"unknown.png"}" alt="${escapeHtml(app.name)}"></figure>
    </div>
    <div class="tile-content">
      <p class="tile-title text-bold">${escapeHtml(app.name)} ${versionInfo}</p>
      <p class="tile-subtitle">${escapeHtml(app.description)}</p>
    </div>
    <div class="tile-action">
      <button class="btn btn-link btn-action btn-lg ${app.allow_emulator?"":"d-hide"}" appid="${app.id}" title="Try in Emulator"><i class="icon icon-share"></i></button>
      <button class="btn btn-link btn-action btn-lg ${version.canUpdate?"":"d-hide"}" appid="${app.id}" title="Update App"><i class="icon icon-refresh"></i></button>
      <button class="btn btn-link btn-action btn-lg ${!appInstalled?"":"d-hide"}" appid="${app.id}" title="Upload App"><i class="icon icon-upload"></i></button>
      <button class="btn btn-link btn-action btn-lg ${appInstalled?"":"d-hide"}" appid="${app.id}" title="Remove App"><i class="icon icon-delete"></i></button>
      <button class="btn btn-link btn-action btn-lg ${app.custom?"":"d-hide"}" appid="${app.id}" title="Customise and Upload App"><i class="icon icon-menu"></i></button>
    </div>
  </div>
  `;}).join("");
  // set badge up top
  var tab = document.querySelector("#tab-librarycontainer a");
  tab.classList.add("badge");
  tab.setAttribute("data-badge", appJSON.length);
  htmlToArray(panelbody.getElementsByTagName("button")).forEach(button => {
    button.addEventListener("click",event => {
      var button = event.currentTarget;
      var icon = button.firstChild;
      var appid = button.getAttribute("appid");
      var app = appNameToApp(appid);
      if (!app) throw new Error("App "+appid+" not found");
      // check icon to figure out what we should do
      if (icon.classList.contains("icon-share")) {
        // emulator
        var file = app.storage.find(f=>f.name[0]=='-');
        if (!file) {
          console.error("No entrypoint found for "+appid);
          return;
        }
        var baseurl = window.location.href;
        var url = baseurl+"apps/"+app.id+"/"+file.url;
        window.open(`https://espruino.com/ide/emulator.html?codeurl=${url}&upload`);
      } else if (icon.classList.contains("icon-upload")) {
        // upload
        icon.classList.remove("icon-upload");
        icon.classList.add("loading");
        Comms.uploadApp(app).then((appJSON) => {
          if (appJSON) appsInstalled.push(appJSON);
          showToast(app.name+" Uploaded!", "success");
          icon.classList.remove("loading");
          icon.classList.add("icon-delete");
          refreshMyApps();
          refreshLibrary();
        }).catch(err => {
          showToast("Upload failed, "+err, "error");
          icon.classList.remove("loading");
          icon.classList.add("icon-upload");
        });
      } else if (icon.classList.contains("icon-menu")) {
        // custom HTML update
        if (app.custom) {
          icon.classList.remove("icon-menu");
          icon.classList.add("loading");
          handleCustomApp(app).then((appJSON) => {
            if (appJSON) appsInstalled.push(appJSON);
            showToast(app.name+" Uploaded!", "success");
            icon.classList.remove("loading");
            icon.classList.add("icon-delete");
            refreshMyApps();
            refreshLibrary();
          }).catch(err => {
            showToast("Customise failed, "+err, "error");
            icon.classList.remove("loading");
            icon.classList.add("icon-menu");
          });
        }
      } else if (icon.classList.contains("icon-delete")) {
        // Remove app
        icon.classList.remove("icon-delete");
        icon.classList.add("loading");
        removeApp(app);
      } else if (icon.classList.contains("icon-refresh")) {
        // Update app
        icon.classList.remove("icon-refresh");
        icon.classList.add("loading");
        updateApp(app);
      }
    });
  });
}

refreshLibrary();
// =========================================== My Apps

function removeApp(app) {
  return showPrompt("Delete","Really remove '"+app.name+"'?").then(() => {
    return Comms.removeApp(app);
  }).then(()=>{
    appsInstalled = appsInstalled.filter(a=>a.id!=app.id);
    showToast(app.name+" removed successfully","success");
    refreshMyApps();
    refreshLibrary();
  }, err=>{
    showToast(app.name+" removal failed, "+err,"error");
  });
}

function updateApp(app) {
  Comms.removeApp(app).then(()=>{
    showToast(app.name+" removed successfully. Updating...",);
    appsInstalled = appsInstalled.filter(a=>a.id!=app.id);
    return Comms.uploadApp(app);
  }).then((appJSON) => {
    if (appJSON) appsInstalled.push(appJSON);
    showToast(app.name+" Updated!", "success");
    refreshMyApps();
    refreshLibrary();
  }, err=>{
    showToast(app.name+" update failed, "+err,"error");
  });
}

function appNameToApp(appName) {
  var app = appJSON.find(app=>app.id==appName);
  if (app) return app;
  /* If app not known, add just one file
  which is the JSON - so we'll remove it from
  the menu but may not get rid of all files. */
  return { id: appName,
    name: "Unknown app "+appName,
    icon: "../unknown.png",
    description: "Unknown app",
    storage: [ {name:"+"+appName}],
    unknown: true,
  };
}

function showLoadingIndicator(id) {
  var panelbody = document.querySelector(`#${id} .panel-body`);
  var tab = document.querySelector(`#tab-${id} a`);
  // set badge up top
  tab.classList.add("badge");
  tab.setAttribute("data-badge", "");
  // Loading indicator
  panelbody.innerHTML = '<div class="tile column col-12"><div class="tile-content" style="min-height:48px;"><div class="loading loading-lg"></div></div></div>';
}

function refreshMyApps() {
  var panelbody = document.querySelector("#myappscontainer .panel-body");
  var tab = document.querySelector("#tab-myappscontainer a");
  tab.setAttribute("data-badge", appsInstalled.length);
  panelbody.innerHTML = appsInstalled.map(appJSON => {
var app = appNameToApp(appJSON.id);
var version = getVersionInfo(app, appJSON);
return `<div class="tile column col-6 col-sm-12 col-xs-12">
    <div class="tile-icon">
      <figure class="avatar"><img src="apps/${app.icon?`${app.id}/${app.icon}`:"unknown.png"}" alt="${escapeHtml(app.name)}"></figure>
    </div>
    <div class="tile-content">
      <p class="tile-title text-bold">${escapeHtml(app.name)} <small>(${version.text})</small></p>
      <p class="tile-subtitle">${escapeHtml(app.description)}</p>
    </div>
    <div class="tile-action">
      <button class="btn btn-link btn-action btn-lg ${version.canUpdate?'':'d-hide'}" appid="${app.id}" title="Update App"><i class="icon icon-refresh"></i></button>
      <button class="btn btn-link btn-action btn-lg" appid="${app.id}" title="Remove App"><i class="icon icon-delete"></i></button>
    </div>
  </div>
  `}).join("");
  htmlToArray(panelbody.getElementsByTagName("button")).forEach(button => {
    button.addEventListener("click",event => {
      var button = event.currentTarget;
      var icon = button.firstChild;
      var appid = button.getAttribute("appid");
      var app = appNameToApp(appid);
      if (!app) throw new Error("App "+appid+" not found");
      // check icon to figure out what we should do
      if (icon.classList.contains("icon-delete")) removeApp(app);
      if (icon.classList.contains("icon-refresh")) updateApp(app);
    });
  });
}

function getInstalledApps() {
  showLoadingIndicator("myappscontainer");
  showLoadingIndicator("myfscontainer");
  // Get apps and files
  return Comms.getInstalledApps()
    .then(appJSON => {
      appsInstalled = appJSON;
      refreshMyApps();
      refreshLibrary();
    })
    .then(Comms.listFiles)
    .then(list => {
      files = list;
      refreshMyFS();
    })
    .then(() => handleConnectionChange(true));
}

var connectMyDeviceBtn = document.getElementById("connectmydevice");

function handleConnectionChange(connected) {
  connectMyDeviceBtn.textContent = connected ? 'Disconnect' : 'Connect';
  connectMyDeviceBtn.classList.toggle('is-connected', connected);
}

htmlToArray(document.querySelectorAll(".btn.refresh")).map(button => button.addEventListener("click", () => {
  getInstalledApps().catch(err => {
    showToast("Getting app list failed, "+err,"error");
  });
}));
connectMyDeviceBtn.addEventListener("click", () => {
  if (connectMyDeviceBtn.classList.contains('is-connected')) {
    Comms.disconnectDevice();
  } else {
    getInstalledApps().catch(err => {
      showToast("Device connection failed, "+err,"error");
    });
  }
});
Comms.watchConnectionChange(handleConnectionChange);

var filtersContainer = document.querySelector("#librarycontainer .filter-nav");
filtersContainer.addEventListener('click', ({ target }) => {
  if (!target.hasAttribute('filterid')) return;
  if (target.classList.contains('active')) return;

  activeFilter = target.getAttribute('filterid');
  filtersContainer.querySelector('.active').classList.remove('active');
  target.classList.add('active');
  refreshLibrary();
});

var librarySearchInput = document.querySelector("#searchform input");

librarySearchInput.addEventListener('input', evt => {
  currentSearch = evt.target.value.toLowerCase();
  refreshLibrary();
});


// =========================================== My Files

function refreshMyFS() {
  var panelbody = document.querySelector("#myfscontainer .panel-body");
  var tab = document.querySelector("#tab-myfscontainer a");
  tab.setAttribute("data-badge", files.length);
  panelbody.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
      </tr>
    </thead>
    <tbody>${
    files.map(file =>
      `<tr data-name="${file}"><td>${escapeHtml(file)}</td><td>${fileType(file).name}</td></li>`
    ).join("")}
    </tbody>`;

  htmlToArray(panelbody.getElementsByTagName("tr")).forEach(row => {
    row.addEventListener("click",event => {
      var name = event.target.closest('tr').dataset.name;
      const type = fileType(name);
      Comms.readFile(name).then(content => content.length && saveAs(new Blob([content], type), name));
    });
  });
}

function fileType(file) {
  switch (file[0]) {
    case "+": return { name: "App descriptor", type: "application/json;charset=utf-8" };
    case "*": return { name: "App icon", type: "text/plain;charset=utf-8" };
    case "-": return { name: "App code", type: "application/javascript;charset=utf-8" };
    case "=": return { name: "Boot-time code", type: "application/javascript;charset=utf-8" };
    default: return { name: "Plain", type: "text/plain;charset=utf-8" };
  }
}

// =========================================== About

document.getElementById("settime").addEventListener("click",event=>{
  Comms.setTime().then(()=>{
    showToast("Time set successfully","success");
  }, err=>{
    showToast("Error setting time, "+err,"error");
  });
});
document.getElementById("removeall").addEventListener("click",event=>{
  showPrompt("Remove All","Really remove all apps?").then(() => {
    return Comms.removeAllApps();
  }).then(()=>{
    appsInstalled = [];
    showToast("All apps removed","success");
    return getInstalledApps();
  }).catch(err=>{
    showToast("App removal failed, "+err,"error");
  });
});
// Install all default apps in one go
document.getElementById("installdefault").addEventListener("click",event=>{
  var defaultApps, appCount;
  httpGet("defaultapps.json").then(json=>{
    defaultApps = JSON.parse(json);
    defaultApps = defaultApps.map( appid => appJSON.find(app=>app.id==appid) );
    if (defaultApps.some(x=>x===undefined))
      throw "Not all apps found";
    appCount = defaultApps.length;
    return showPrompt("Install Defaults","Remove everything and install default apps?");
  }).then(() => {
    return Comms.removeAllApps();
  }).then(()=>{
    appsInstalled = [];
    showToast(`Existing apps removed. Installing  ${appCount} apps...`);
    return new Promise(resolve => {
      function upload() {
        var app = defaultApps.shift();
        if (app===undefined) return resolve();
        Comms.uploadApp(app).then((appJSON) => {
          if (appJSON) appsInstalled.push(appJSON);
          showToast(`(${appCount-defaultApps.length}/${appCount}) ${app.name} Uploaded`);
          upload();
        });
      }
      upload();
    });
  }).then(()=>{
    showToast("Default apps successfully installed!","success");
    return getInstalledApps();
  }).catch(err=>{
    showToast("App Install failed, "+err,"error");
  });
});
