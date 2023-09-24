//---------------------------------------------------------------------------------
//globals & consts
//---------------------------------------------------------------------------------
const DEBUGMODERAMUSE = 1;

let memStart;
if (DEBUGMODERAMUSE)
  memStart = process.memory(true);

const DEBUGMODE = 1;
const DEBUGMODEINPUT = 0;
const DEBUGMODESPEED = 1;

// The diffrent difficultys
const VERYEASY = 0;
const EASY = 1;
const HARD = 2;
const VERYHARD = 3;

// The diffrent gameStates possible in the game
const GSGAME = 1;
const GSTITLESCREEN = 2;
const GSDIFFICULTYSELECT = 3;
const GSCREDITS = 4;

const GSINITDIFF = 50;

const GSGAMEINIT = (GSGAME + GSINITDIFF);
const GSTITLESCREENINIT = (GSTITLESCREEN + GSINITDIFF);
const GSDIFFICULTYSELECTINIT = (GSDIFFICULTYSELECT + GSINITDIFF);
const GSCREDITSInit = (GSCREDITS + GSINITDIFF);

//game defines
const NROFROWS = 9;
const NROFCOLS = 9;
const TILEWIDTH = 16;
const TILEHEIGHT = 16;
const IDPEG = 1;
const XOFFSET = 14;
const YOFFSET = 4;

//game
let GameSelector;
let PrintFormShown = false;
let BoardParts; // boardparts instance that will hold all the boardparts
let Difficulty = VERYEASY;
let Moves = 0;
let BestPegsLeft = new Uint8Array(4); // array that holds the best amount of pegs left for each difficulty
BestPegsLeft[0] = 5;
BestPegsLeft[1] = 15;
let GameState;
let needRedraw;
let pegsLeft;
let prevPegsLeft;
let movesLeftX;
let movesLeftY;
let movesLeftCount;
let prevMovesLeftCount;
let movesLeftTimer;

//input
let dragLeft = false;
let dragRight = false;
let dragUp = false;
let dragDown = false;
let btnA = false;
let btnB = false;

//---------------------------------------------------------------------------------
//Images
//---------------------------------------------------------------------------------
const IMGCREDITS = {
  width: 176,
  height: 176,
  bpp: 1,
  buffer: require("heatshrink").decompress(atob("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"))
};

const IMGPEG = {
  width : 16,
  height : 16,
  bpp : 1,
  buffer : require("heatshrink").decompress(atob("AAMv/1S3kp9k3+0f+1f+0P+Uf+kvAYPsh2GqWqkFIgsKD48o1kxq0S01Vq0K0UVqkqAYNMhWGqAfMH74f/T8EMmEGiEGrADBgUQgk4AYMMhkGD44"))
};

const IMGBACKGROUND = {
  width: 176,
  height: 176,
  bpp: 1,
  buffer: require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AD4A=="))
};
const IMGEASYINFO = {
  width: 176,
  height: 176,
  bpp: 1,
  buffer: require("heatshrink").decompress(atob("AH4A/AD0OgPAAgIDBmAKCgYRFh+ACofMBIWAmAABCpAmCh0DzgKDmFwuAVHh3e+fPh1770Pnk958+vF58F78ffj08FYXf+/fh37zkfCoPfn1wufg/fnAwN8CoXZ++eCoUb2Ex7c3CoNw7d37e2CocZIIQVJ5d2CokOjJBFmEx74VCIIIrB3wVDjBtDx0PCoPPm84nJtBCoOeNoQAJh4HGjzhMCqoA/AH4A7gf4vHz/gGBvAVO/05+/cAwN54AVN70B44GCCp/Ovf//n889791+n0/j8c8AVH54VG/1+n8/zoVJvPHnvO8955/g+933efI44VE4AVB4/g/8/38PCpHOCpF/x+PCpnO+954fA+RBB4+AV5AVBnn8v958fOv9/3+HCpH4Co2OTIOfw75QEwcHCp8HCocPCp4QEjwVPAH4A/AH4A/AH4ARgf//wEBh8cBgvACps8Cp8AgwVD/PZ8/8vP59wVN3v5/f3/39Cp/97v729+9vcIJ397nz+9+AgIVjh39/AVEK5sO7n4uIVBvoVLozbTgFmCqd/+wURn//gFn//gCqVHCqMwAgdghwDBuAIDDwYLBgeAmEEu4VIUQIVD5wVEqoVFAAQVFb4IrHh/H5/38/P5888EO58/914+YVChAVDCIN394DBv3gh/f3vu/v7K4/O91xAQPmlwVB7u453s3ZXH9wVEn3gg+fCoPgFYkgColzxwVBIIIVD9oVDgGgCoXv5xXB53nv3mCoRXCzEwj4TBCoXnCoICBCoPugePCoN5/e4mEOgKkBC4IAGW4sAnBBCNoQVHhgGFmEwAoYVIAA8//8Ag//dAYVigEDgEGAoXuBQmACshDECp8H914/n5/HzCp0PcwP9/P5f4IVNh3urvd7vc3YVQvoVCFaP9CoPdCp5XECqCDB/iDBCpn//wHEjDxNCo34CpgAH+AVUAH4A/AH4A/AH4A/AH4A/AH4A8gPAAYfgBw8D//+AgMf4EB4P4CoPMCqP8AwMMHREDgEGAgMcj+P4POvl573n5/OCpUfz+f4PM/n973vCpud7pBB9395nu9xZGIIsdCoP4919CqXA93dCp0f7vfCoJXB53v53uCpnPCoKDB53nCpgAQCtU//8Ag//fxAVdmAEDsBHBweD3AVQj07Cql4FgIVSvefz+5LpQVFj973+/3fwCpcHCof73YAB2AVLgoVHFaoVMK4cd/ZXPCom7QYQVQeKwVkn//QgP/apQVbgEDgEGCaAV/Cv4V/CpH//wVoAH4A/ABAA="))
};
const IMGVERYEASYINFO = {
  width: 176,
  height: 176,
  bpp: 1,
  buffer: require("heatshrink").decompress(atob("AH4A/AD0OgPAAgIDBmAKCgYRFh+ACofMBIWAmAABCpAmCh0DzgKDmFwuAVHh3e+fPh1770Pnk958+vF58F78ffj08FYXf+/fh37zkfCoPfn1wufg/fnAwN8CoXZ++eCoUb2Ex7c3CoNw7d37e2CocZIIQVJ5d2CokOjJBFmEx74VCIIIrB3wVDjBtDx0PCoPPm84nJtBCoOeNoQAJh4HGjzhMCqoA/AH4A7gf4vHz/gGBvACB8fACpX+nP37gGBvISB8eACpXegPHAwQVC+YVL517//8/nnvfuv1zx+fDAN8v0+nJJCgfPCo3+u+fz93wH8v1/nYVEvPHnvO8955/gu8971/gPu993n5JCConACoPH8E/n/en8B/1/v0fCofOCpv/j4VI533vPD4E+nmej0B8hBBx6vECoM8/l/vPj50ej/ej0AFYN/h7bECo2Oj0Pz0cgF8v8/hz5LYYYVBAAQVLg4VDngJDIwIAJJocAvAEDDQgA/AH4A/AH4A/ADED//+AgMPjgMF4AVNngVPgEGCof57Pn/l5/PuCpu9/P7+/+/oVP/vd/e3v3t7hBO/vc+f3vwEBCscO/v4CohXNh3c/FxCoN9CpdGbacAswVTv/2CiM//8As//8AVSo4VRmAEDsEOAYNwBAYeDBYMDwEwgl3CpCiBCofOColVCooACCorfBFY8P4/P+/n5/Pnngh3Pn/uvHzCoUICoYRBu/vAYN+8EP7+9939/ZXH53uuICB80uCoPd3HO9m7K4/uCok+8EHz4VB8ArEkAVEueOCoJBBCoftCocA0AVC9/OK4PO89+8wVCK4WYmEfCYIVC84VBAQIVB90Dx4VBvP73Ewh0BUgIXBAAy3FgE4IIRtCCo8MAwswmAFDCpAAHn//gEH/7oDCsUAgcAgwFC9wKEwAVkIYgVPg/uvH8/P4+YVOh7mB/v5/L/BCpsO91d7vd7m7CqF9CoQrR/oVB7oVPK4gVQQYP8QYIVM//+A4kYeJoVG/AVMAA/wCqgA/AH4A/AH4A/AH4A/AH4A/AHkB4ADD8AOHgf//wEBj/AgPB/AVB5gVR/gGBhg6IgcAgwEBjkfx/B518vPe8/P5wVGu92FYWfz/B5n8/ve94VIqtWCoWd7pBB9395nu9xZGFYkcjoVB/HuvoVKK4gVC4Hu7orOj/d74VBK4PO9/O9xXL7vPCoKDB53nCpArDACBXECqIrTn//qtX/7+ICpN3u4VRmAEDsAEDhwVKm4qBAANgg4VOmtVAAQVBwArUz+d23v4+fvBXNh+fz+/9/P738FZsP7vf3/O53c9hXNCoPPj/O9/cFZ0fCpxXFjn958dFaIVB44VB8/cvhXNA4MGeJgrFA4MeCphXFAQMcCpk//4qB//gCRgVEqtXCqMAgd3uwTQCoR+OFblVqwrpK/5Xt//+CtAA/AH4AIA="))
};
const IMGHARDINFO = {
  width: 176,
  height: 176,
  bpp: 1,
  buffer: require("heatshrink").decompress(atob("AH4A/AD0OgPAAgIDBmAKCgYRFh+ACofMBIWAmAABCpAmCh0DzgKDmFwuAVHh3e+fPh1770Pnk958+vF58F78ffj08FYXf+/fh37zkfCoPfn1wufg/fnAwN8CoXZ++eCoUb2Ex7c3CoNw7d37e2CocZIIQVJ5d2CokOjJBFmEx74VCIIIrB3wVDjBtDx0PCoPPm84nJtBCoOeNoQAJh4HGjzhMCqoA/AH4A7gf4vHz/gGBvACB8ACBg4VI/05+/cAwN54AVN70B44GCCp/Ovf//n889791+/0/n9/CpHPCo3+/8/nwVKvPHnvO8955/g+933n3CpnACoPH8Hnn+885XJCpF/Cp3O+954YZBIIIVJ/wVBnn8v958ZbBFYJtJ/AVGxxXCCpAdIwARPAAcHCqkPCiYA/AH4A/AH4A/ACUD//+AgMPjgMF4AVNngVPgEGCof57Pn/l5/PuCpu9/P7+/+/oVP/vd/e3v3t7hBO/vc+f3vwEBCscO/v4CohXNh3c/FxCoN9CpdGbacAswVTv/2CiM//8As//8AVSo4VRmAEDsEOAYNwBAYeDBYMDwEwgl3CpCiBCofOColVCooACCorfBFY8P4/P+/n5/Pnngh3Pn/uvHzCoRXDh4RBu/vAYN+8EP7+9939/YVCKARBB53uuICB80uCoPd3HO9m7CoVQCofuCok+8EHz4VB8ArICoNzxwVBIIIVD9oVDV4nv5xXB53nv3mCoRXEj4VE84VBAQIVB90Dx4VBvIVCVQdgdI63FeIRBECo8MCo4EDCpAAHn//gEH/7oDCsUAgcAgwTQCv4V/Cv4VI//+CtAA/AH4A/AH4A/AH4A/AH4A/AH4AagPAAYfgBw8D//+AgMf4EB4P4CoPMCqP8AwMMHREDgEGAgMcj+P4POvl573n5/OCo13uwrCz+f4PM/n973vCpFVqwVCzvdIIPu/vM93uLIwrEjkdCoP4919CpRXECoXA93dFZ0f7vfCoJXB53v53uK5fd54VBQYPO84VIFYYAQK4gVRFac//9Vq//fxAVJu93CqMwAgdgAgcOCpU3FQIABsEHCp01qoACCoOAFamfzu29/Hz94K5sPz+f3/v5/e/grNh/d7+/53O7nsK5oVB58f53v7grOj4VOK4sc/vPjorRCoPHCoPn7l8K5oHBgzxMFYoHBjwVMK4oCBjgVMn//FQP/8ASMColVq4VRgEDu92CaAVCPxwrcqtWFdJX/K9v//wVoAH4A/ABAA=="))
};
const IMGVERYHARDINFO = {
  width: 176,
  height: 176,
  bpp: 1,
  buffer: require("heatshrink").decompress(atob("AH4A/AD0OgPAAgIDBmAKCgYRFh+ACofMBIWAmAABCpAmCh0DzgKDmFwuAVHh3e+fPh1770Pnk958+vF58F78ffj08FYXf+/fh37zkfCoPfn1wufg/fnAwN8CoXZ++eCoUb2Ex7c3CoNw7d37e2CocZIIQVJ5d2CokOjJBFmEx74VCIIIrB3wVDjBtDx0PCoPPm84nJtBCoOeNoQAJh4HGjzhMCqoA/AH4A7gf4vHz/gGBvANGwADBjgHD/05+/cAwN54AVN70B44GCCp/Ovf//n889791+88fn/nJ4P8/pPCCoPPCo3+98/n3vgYKB/IVFvPHnvO8955/g/173n+gfd73zMoQVF4AVB4/gv1/3l+gec/3zzhXECpmdCpXO+954fAvl5nk8CoJBBCon+CoM8/l/vPj508n+8CoX++JtE/AVGx08j88nBXCCoj5IX4UAnAQKAAkHCod4Cp8PAgfwCp4A/AH4A/AH4A/ACMD//+AgMPjgMF4AVNngVPgEGCof57Pn/l5/PuCpu9/P7+/+/oVP/vd/e3v3t7hBO/vc+f3vwEBCscO/v4CohXNh3c/FxCoN9CpdGbacAswVTv/2CiM//8As//8AVSo4VRmAEDsEOAYNwBAYeDBYMDwEwgl3CpCiBCofOColVCooACCorfBFY8P4/P+/n5/Pnngh3Pn/uvHzCoRXDh4RBu/vAYN+8EP7+9939/YVCKARBB53uuICB80uCoPd3HO9m7CoVQCofuCok+8EHz4VB8ArICoNzxwVBIIIVD9oVDV4nv5xXB53nv3mCoRXEj4VE84VBAQIVB90Dx4VBvIVCVQdgdI63FeIRBECo8MCo4EDCpAAHn//gEH/7oDCsUAgcAgwTQCv4V/Cv4VI//+CtAA/AH4A/AH4A/AH4A/AH4A/AH4AagPAAYfgBw8D//+AgMf4EB4P4CoPMCqP8AwMMHREDgEGAgMcj+P4POvl573n5/OCpUfz+f4PM/n973vCpud7pBB9395nu9xZGIIsdCoP4919CqXA93dCp0f7vfCoJXB53v53uCpnPCoKDB53nCpgAQCtU//8Ag//fxAVdmAEDsBHBweD3AVQj07Cql4FgIVSvefz+5LpQVFj973+/3fwCpcHCof73YAB2AVLgoVHFaoVMK4cd/ZXPCom7QYQVQeKwVkn//QgP/apQVbgEDgEGCaAV/Cv4V/CpH//wVoAH4A/ABAA=="))
};
const IMGTITLE = {
  width: 176,
  height: 176,
  bpp: 1,
  buffer: require("heatshrink").decompress(atob("/4AUwAqTgIV/CrcD//4AgQJBuEAh4VKgUAgwEBg1ggGMgEJHQoVGgYVCkAVQAwQVRn/44AVD/gVNkEMCol8Cp0ECogABCp3gCqnvgPmn+AuEP5OBLYJXK/ODm0A8HcjE5w+OCpUZ6GCCoMwxkwgOOXISZI8IVCn+Yxkv8OJ/h3BYpEHCoV/zmMp/xzf8oAVIv/PyAVBuHcxlOiOz4VgCpUQCoVMxnOjOjwVwCpPsCoVgCoOchOjgQVJsEmCodOCokwCpM2CpIrKiYVF7kRCpkbQYVg5mMpiDBCpcJzGGQYKvBpkxzMG+AVJhvIzjbB3mMk7bC8AVJgnM+E2gE8xkwgOMgbxJsEG80PK4P4xkYnOGh4VIgfggfj//z//w/kP/+D/4QDCokBCoPh//x//gvkH/+B/4PCCooAQCv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/CtGB5n//wID+EA/EB8Ph8H4gE8nk+j0BwVzycyDoecgOPgUzncbxEAoVnschgODue/mVx/+Hg0EuMZxkehUKhEAwPB4PAwOBmc/mX7//fw12/8Z5gAB914gGZzOd5gVCAAOGgFwo1/g0ApoVB8gVB3OY7v8CoMhCoMis92ocemc54+cCoMM/n7zH5iIVBkoVBgV3uPB41TnMBmgVBsmEmWY2cQwOAxlTmd+u98o/iCoMCsgVC/lkzHmvgVGu1G+VznPEvnO91kgHPzPHNoIVDg13uVCg8HnFMhyZBhiZC4HBCoPO6cyx13rHBxuNKoMLicbzAVBseA8cBwFzz/8vPd5+A/Hw8eH/Ph+D4B/8+v+eCoLuCACAV/Ct3/ACgA=="))
};
const IMGNEWGAME2 = {
  width: 98,
  height: 19,
  bpp: 1,
  buffer: require("heatshrink").decompress(atob("AEkEggFDqoLEgWCAoco0AMEqFAAgUUiALElEgDocCBYkFgkUiMEgMAgNBqMBoECkUKxGigGggWo1Wg1EAqlEiMVoEQiFAiNEoMAkWi1EqkEKAAOIkAZBglUoEVqAwBgtBiFEIYMKkECxUAkEihGChWAgFBGANFMIUEJwIwBkEgFQOAgWqkQFBxAwBikUgh3BisFqMQoNQYcg"))
};
const IMGNEWGAME1 = {
  width: 98,
  height: 19,
  bpp: 1,
  buffer: require("heatshrink").decompress(atob("AEkMhgFDv4LEgeDAoc58AME+HAAgUcjALEnkwAgUHgwLEh+MnkxwkDwED4dzwPggdzj+M8cAAwP4//w/kA7nMmc94E4nHCnPGseAmez/lvuEOhwrBsO/8EMvnAj/YGAOP8cYtxhBh8wg+egFwscY40bwEA4fMmPnwBhBw0xw1hwEwuOcmPAgf+mfMsOMGAMcn0MOAM/g/zjFh+DDkA=="))
};
const IMGCREDITS2 = {
  width: 69,
  height: 18,
  bpp: 1,
  buffer: require("heatshrink").decompress(atob("ACOoAYUI0ADBhQDCgEihADBwGAAYMCAoIQBAgIZCAgWgkGIkEKxWqB4QFB0GqkWi1EogEokWKkWIhApBgWChGiDgOADQOIlWiBIMCwEgCYQbBhEKAoOChUAwUoDAWKkEoA4IlBkEq0GA1UqxUqkUAlRSBIgMg0B2DABw"))
};
const IMGCREDITS1 = {
  width: 69,
  height: 18,
  bpp: 1,
  buffer: require("heatshrink").decompress(atob("ACEB/gEChngAYMe+AICs8YCAPB4AHBgcAAgMOgwQCjAEC8ExzFwh3O/0eg8Ah/P8P+u/z/E4gF4seeueMjApBgeHjnjzlg4EOgeYn/nhnjg/AmATBwE4IgMfwPB40OgPHnAYBg+emE544BBhlwn/hwP+n/On13gF+hkH8H+uHx/CKRA="))
};

//---------------------------------------------------------------------------------
//CMainMenu
//---------------------------------------------------------------------------------
class CSelector {
  constructor(PlayFieldXin, PlayFieldYin) {
    this.SelectedPoint = {
      X: 0,
      Y: 0
    };
    this.CurrentPoint = {
      X: PlayFieldXin,
      Y: PlayFieldYin
    };
    this.HasSelection = false;
  }
}

function CSelector_Create(PlayFieldXin, PlayFieldYin) {
  const Result = new CSelector(PlayFieldXin, PlayFieldYin);
  return Result;
}

function CSelector_SetPosition(Selector, PlayFieldXin, PlayFieldYin) {
  if (
    (PlayFieldYin >= 0 && PlayFieldYin < 3 && PlayFieldXin > 2 && PlayFieldXin < 6) ||
    (PlayFieldYin > 2 && PlayFieldYin < 6 && PlayFieldXin >= 0 && PlayFieldXin < NROFCOLS) ||
    (PlayFieldYin > 5 && PlayFieldYin < NROFROWS && PlayFieldXin > 2 && PlayFieldXin < 6)
  ) {
    Selector.CurrentPoint.X = PlayFieldXin;
    Selector.CurrentPoint.Y = PlayFieldYin;
  }
}

function CSelector_Select(Selector) {
  Selector.SelectedPoint.X = Selector.CurrentPoint.X;
  Selector.SelectedPoint.Y = Selector.CurrentPoint.Y;
  Selector.HasSelection = true;
}

function CSelector_GetSelection(Selector) {
  return Selector.SelectedPoint;
}

function CSelector_GetPosition(Selector) {
  return Selector.CurrentPoint;
}

function CSelector_DeSelect(Selector) {
  Selector.HasSelection = false;
}

function CSelector_Draw(Selector) {
  "compiled";
  let bg = g.getBgColor();
  let fg = g.getColor();
  g.setColor(fg);
  g.drawRect(
    XOFFSET + Selector.CurrentPoint.X * TILEWIDTH,
    YOFFSET + Selector.CurrentPoint.Y * TILEHEIGHT,
    XOFFSET + Selector.CurrentPoint.X * TILEWIDTH + TILEWIDTH - 1,
    YOFFSET + Selector.CurrentPoint.Y * TILEHEIGHT + TILEHEIGHT - 1
  );
  g.setColor(fg);
  g.drawRect(
    XOFFSET + Selector.CurrentPoint.X * TILEWIDTH + 1,
    YOFFSET + Selector.CurrentPoint.Y * TILEHEIGHT + 1,
    XOFFSET + Selector.CurrentPoint.X * TILEWIDTH + TILEWIDTH - 1 - 1,
    YOFFSET + Selector.CurrentPoint.Y * TILEHEIGHT + TILEHEIGHT - 1 - 1
  );
  g.setColor(fg);
  g.drawRect(
    XOFFSET + Selector.CurrentPoint.X * TILEWIDTH+2,
    YOFFSET + Selector.CurrentPoint.Y * TILEHEIGHT+2,
    XOFFSET + Selector.CurrentPoint.X * TILEWIDTH + TILEWIDTH - 1 -2,
    YOFFSET + Selector.CurrentPoint.Y * TILEHEIGHT + TILEHEIGHT - 1 -2
  );
}

function CSelector_Destroy(Selector) {
  Selector = null;
}
//---------------------------------------------------------------------------------
//CMainMenu
//---------------------------------------------------------------------------------
class CMainMenu {
  constructor() {
    this.Selection = 1;
  }
}

function CMainMenu_Create() {
  var Result = new CMainMenu();
  return Result;
}

function CMainMenu_GetSelection(MainMenu) {
  return MainMenu.Selection;
}

function CMainMenu_Destroy(MainMenu) {
  MainMenu = null;
}

function CMainMenu_NextItem(MainMenu) {
  MainMenu.Selection++;
  if (MainMenu.Selection == 3)
    MainMenu.Selection = 1;
  //playSelectSound();
}

function CMainMenu_PreviousItem(MainMenu) {
  MainMenu.Selection--;
  if (MainMenu.Selection == 0)
    MainMenu.Selection = 2;
  //playSelectSound();
}

function CMainMenu_Draw(MainMenu) {
  g.drawImage(IMGTITLE, 0, 0);
  var w;
  if (MainMenu.Selection == 1) {
    g.drawImage(IMGNEWGAME1, g.getWidth() / 2 - IMGNEWGAME1.width / 2, 67);
  } else {
    g.drawImage(IMGNEWGAME2, g.getWidth() / 2 - IMGNEWGAME2.width / 2, 67);
  }
  if (MainMenu.Selection == 2) {
    g.drawImage(IMGCREDITS1, g.getWidth() / 2 - IMGCREDITS1.width / 2, 105);
  } else {
    g.drawImage(IMGCREDITS2, g.getWidth() / 2 - IMGCREDITS2.width / 2, 105);
  }
}

//---------------------------------------------------------------------------------
//CBoardParts
//---------------------------------------------------------------------------------
class CBoardParts {
  constructor() {
   this.Items = new Array(NROFROWS);
   for (let i = 0; i < NROFROWS; i++)
     this.Items[i] = new Array(NROFCOLS);
  }
}

function CBoardParts_Create() {
  const Result = new CBoardParts();
  return Result;
}

function CBoardParts_Destroy(BoardParts) {
  CBoardParts_RemoveAll(BoardParts);
  BoardParts = null;
}

function CBoardParts_GetPart(BoardParts, PlayFieldXin, PlayFieldYin) {
  if ((PlayFieldXin < 0) || (PlayFieldXin >= NROFCOLS) || (PlayFieldYin < 0) || (PlayFieldYin >= NROFROWS))
    return null;

  return BoardParts.Items[PlayFieldYin][PlayFieldXin];
}

function CBoardParts_RemoveAll(BoardParts) {
  for (let y = 0; y < NROFROWS; y++)
    for (let x = 0; x < NROFCOLS; x++)
      BoardParts.Items[y][x] = null;
  BoardParts.ItemCount = 0;
}

function CBoardParts_Add(BoardParts, BoardPart) {
  if ((BoardPart.PlayFieldX < NROFCOLS) && (BoardPart.PlayFieldY < NROFROWS)) {
    BoardParts.Items[BoardPart.PlayFieldY][BoardPart.PlayFieldX] = BoardPart;
    BoardParts.ItemCount++;
  }
}

function CBoardParts_Draw(BoardParts) {
  "compiled";
  for (let y = 0; y < NROFROWS; y++)
    for (let x = 0; x < NROFCOLS; x++)
      if (BoardParts.Items[y][x])
        CPeg_Draw(BoardParts.Items[y][x]);
}

//---------------------------------------------------------------------------------
//CPeg
//---------------------------------------------------------------------------------
class CPeg {
  constructor(PlayFieldXin, PlayFieldYin) {
    this.Type = IDPEG;
    this.AnimPhase = 0;
    this.PlayFieldX = PlayFieldXin;
    this.PlayFieldY = PlayFieldYin;
    this.X = XOFFSET + PlayFieldXin * TILEWIDTH;
    this.Y = YOFFSET + PlayFieldYin * TILEHEIGHT;
  }
}

function CPeg_Create(PlayFieldXin, PlayFieldYin) {
  let Result = new CPeg(PlayFieldXin, PlayFieldYin);
  return Result;
}

function CPeg_SetPosition(Peg, PlayFieldXin, PlayFieldYin) {
  if (PlayFieldXin >= 0 && PlayFieldXin < NROFCOLS && PlayFieldYin >= 0 && PlayFieldYin < NROFROWS) {
    Peg.PlayFieldX = PlayFieldXin;
    Peg.PlayFieldY = PlayFieldYin;
    Peg.X = XOFFSET + PlayFieldXin * TILEWIDTH;
    Peg.Y = YOFFSET + PlayFieldYin * TILEHEIGHT;
  }
}

function CPeg_CanMoveTo(Peg, PlayFieldXin, PlayFieldYin, erase) {
  "compiled";
  if (!Peg)
    return false;

  if (Peg.AnimPhase > 2)
    return false;

  let part = CBoardParts_GetPart(BoardParts, PlayFieldXin, PlayFieldYin);
  if (!part)
    return false;

  if (part.AnimPhase != 6)
    return false;

  let Xi = (Math.abs(PlayFieldXin - Peg.PlayFieldX) / 2) | 0;
  let Yi = (Math.abs(PlayFieldYin - Peg.PlayFieldY) / 2) | 0;

  if (Difficulty == VERYHARD || Difficulty == HARD) {
    if (!((Xi == 0 && Yi == 1) || (Xi == 1 && Yi == 0)))
      return false;
  } else {
    if (!((Xi == 0 && Yi == 1) || (Xi == 1 && Yi == 0) || (Xi == 1 && Yi == 1)))
      return false;
  }

  let px,py;
  if (PlayFieldXin < Peg.PlayFieldX) {
    px = PlayFieldXin + Xi;
  } else {
    px = Peg.PlayFieldX + Xi;
  }

  if (PlayFieldYin < Peg.PlayFieldY) {
    py = PlayFieldYin + Yi;
  } else {
    py = Peg.PlayFieldY + Yi;
  }

  let part2 = CBoardParts_GetPart(BoardParts,px, py);
  if (!part2)
    return false;

  if (part2.AnimPhase > 1)
    return false;

  if (erase) {
    part2.AnimPhase = 6;
  }
  return true;
}

function CPeg_Draw(Peg) {
  "ram";
  g.drawImage(IMGPEG, Peg.X, Peg.Y, {
    frame: Peg.AnimPhase
  });
}

function CPeg_Destroy(Peg) {
  Peg = null;
}

//---------------------------------------------------------------------------------
//Game
//---------------------------------------------------------------------------------
function GameInit() {
  CSelector_SetPosition(GameSelector, 4, 4);
  InitBoard();
  Moves = 0;
  //playStartSound();
  PrintFormShown = false;
  g.drawImage(IMGBACKGROUND, 0, 0);
  CBoardParts_Draw(BoardParts);
  CSelector_Draw(GameSelector);
  prevPegsLeft = 44;
  prevMovesLeftCount = 4;
  drawInfo(0, prevMovesLeftCount, prevPegsLeft, BestPegsLeft[Difficulty]);
}

function drawInfo(m, ml, pl, bl) {
  //clear
  let fg = g.getColor();
  let bg = g.getBgColor();
  g.setColor(bg);
  g.clearRect(3, 150, 176, 176);
  g.setColor(fg);
  g.drawString("Moves:" + m.toString() + ", Left:" + ml.toString(), 3, 150);
  if (bl != 0) {
    g.drawString("Pegs Left:" + pl.toString() + ", Best:" + bl.toString(), 3, 162);
  } else {
    g.drawString("Pegs Left:" + pl.toString(), 3, 162);
  }
}

// The main Game Loop
function Game() {
  if (GameState == GSGAMEINIT) {
    GameInit();
    GameState -= GSINITDIFF;
  }
  if (dragLeft) {
    if (!PrintFormShown) {
      //clear selector
      let part1 = CBoardParts_GetPart(BoardParts, CSelector_GetPosition(GameSelector).X, CSelector_GetPosition(GameSelector).Y);
      if (part1)
        CPeg_Draw(part1);
      CSelector_SetPosition(GameSelector, CSelector_GetPosition(GameSelector).X - 1, CSelector_GetPosition(GameSelector).Y);
      CSelector_Draw(GameSelector);

    }
  } else {
    if (dragRight) {
      if (!PrintFormShown) {
        //clear selector
        let part1 = CBoardParts_GetPart(BoardParts, CSelector_GetPosition(GameSelector).X, CSelector_GetPosition(GameSelector).Y);
        if (part1)
          CPeg_Draw(part1);
        CSelector_SetPosition(GameSelector, CSelector_GetPosition(GameSelector).X + 1, CSelector_GetPosition(GameSelector).Y);
        CSelector_Draw(GameSelector);

      }
    } else {
      if (dragUp) {
        if (!PrintFormShown) {
          //clear selector
          let part1 = CBoardParts_GetPart(BoardParts, CSelector_GetPosition(GameSelector).X, CSelector_GetPosition(GameSelector).Y);
          if (part1)
            CPeg_Draw(part1);

          CSelector_SetPosition(GameSelector, CSelector_GetPosition(GameSelector).X, CSelector_GetPosition(GameSelector).Y - 1);
          CSelector_Draw(GameSelector);

        }
      } else {
        if (dragDown) {
          if (!PrintFormShown) {
            //clear selector
            let part1 = CBoardParts_GetPart(BoardParts, CSelector_GetPosition(GameSelector).X, CSelector_GetPosition(GameSelector).Y);
            if (part1)
              CPeg_Draw(part1);

            CSelector_SetPosition(GameSelector, CSelector_GetPosition(GameSelector).X, CSelector_GetPosition(GameSelector).Y + 1);
            CSelector_Draw(GameSelector);

          }
        }
      }
    }
  }
  if (btnB) {
    //need to stop a possible movesleft counting
    //by clearing the interval
    if(movesLeftTimer)
      clearInterval(movesLeftTimer);
    GameState = GSTITLESCREENINIT;
  }
  if (btnA) {
    if (PrintFormShown) {
      GameState = GSTITLESCREENINIT;
      PrintFormShown = false;
    } else {
      if (GameSelector.HasSelection) {
        // see if the selected boardpart can move to the current position
        if (CPeg_CanMoveTo(CBoardParts_GetPart(BoardParts, CSelector_GetSelection(GameSelector).X, CSelector_GetSelection(GameSelector).Y), CSelector_GetPosition(GameSelector).X, CSelector_GetPosition(GameSelector).Y, true)) {
          //playGoodSound();
          //if so play a sound, increase the moves, set the selected part to empty and the current part to red
          Moves++;
          CBoardParts_GetPart(BoardParts, CSelector_GetSelection(GameSelector).X, CSelector_GetSelection(GameSelector).Y).AnimPhase = 6;
          CBoardParts_GetPart(BoardParts, CSelector_GetPosition(GameSelector).X, CSelector_GetPosition(GameSelector).Y).AnimPhase = 0;

          let part1 = CBoardParts_GetPart(BoardParts, CSelector_GetSelection(GameSelector).X, CSelector_GetSelection(GameSelector).Y);
          let part2 = CBoardParts_GetPart(BoardParts, CSelector_GetPosition(GameSelector).X, CSelector_GetPosition(GameSelector).Y);
          if (part1)
            CPeg_Draw(part1);
          if (part2)
            CPeg_Draw(part2);

          //find part in between

          let Xi = Math.floor(Math.abs(CSelector_GetPosition(GameSelector).X - CSelector_GetSelection(GameSelector).X) / 2);
          let Yi = Math.floor(Math.abs(CSelector_GetPosition(GameSelector).Y - CSelector_GetSelection(GameSelector).Y) / 2);
          let LowX = CSelector_GetPosition(GameSelector).X;
          if (LowX > CSelector_GetSelection(GameSelector).X)
            LowX = CSelector_GetSelection(GameSelector).X;
          let LowY = CSelector_GetPosition(GameSelector).Y;
          if (LowY > CSelector_GetSelection(GameSelector).Y)
            LowY = CSelector_GetSelection(GameSelector).Y;
          let part3 = CBoardParts_GetPart(BoardParts, LowX + Xi, LowY + Yi);
          if (part3)
            CPeg_Draw(part3);
          CSelector_Draw(GameSelector);
          // if no moves are left see if the best pegs left value for the current difficulty is
          // greater if so set te new value

          movesLeft();

        } else {
          // if we can't move to the spot, play the wrong move sound, and reset the selection to a red peg (instead of blue / selected)
          let part1 = CBoardParts_GetPart(BoardParts, CSelector_GetSelection(GameSelector).X, CSelector_GetSelection(GameSelector).Y);

          part1.AnimPhase = 0;
          CPeg_Draw(part1);
          CSelector_Draw(GameSelector);
          //playWrongSound();
        }
        CSelector_DeSelect(GameSelector); // deselect the selection
      } else {
        // we didn't have a selection, set the new selection
        let part1 = CBoardParts_GetPart(BoardParts, CSelector_GetPosition(GameSelector).X, CSelector_GetPosition(GameSelector).Y);
        if (part1.AnimPhase == 0) {
          //playSelectSound();
          part1.AnimPhase = 1;
          CPeg_Draw(part1);
          CSelector_Draw(GameSelector);
          CSelector_Select(GameSelector);
        }
      }
    }
  }

  drawInfo(Moves, prevMovesLeftCount, prevPegsLeft, BestPegsLeft[Difficulty]);
  if (prevMovesLeftCount == 0) {
    if (BestPegsLeft[Difficulty] != 0) {
      if (prevPegsLeft < BestPegsLeft[Difficulty]) {
        BestPegsLeft[Difficulty] = prevPegsLeft;
      }
    } else {
      BestPegsLeft[Difficulty] = prevPegsLeft;
    }
    //SaveSettings();
    // if it's the winning game play the winning sound and show the form with the winning message
    if (IsWinningGame(prevPegsLeft)) {
      //playWinnerSound();
      PrintForm("Congrats you have\nsolved the puzzle!\nTry a new\ndifficulty!\n\nTouch to continue");
      PrintFormShown = true;
    } else {
      // show the loser messager, play loser sound
      //playLoserSound();
      PrintForm("You could not solve\nthe puzzle! Don't\ngive up, try it\nagain!\n\nTouch to continue");
      PrintFormShown = true;
    }
  }
}

//---------------------------------------------------------------------------------
//TitleScreen
//---------------------------------------------------------------------------------
function TitleScreenInit() {}

// main title screen loop
function TitleScreen() {
  if (GameState == GSTITLESCREENINIT) {
    TitleScreenInit();
    GameState -= GSINITDIFF;
  }
  if (dragDown) {
    CMainMenu_NextItem(Menu);
  }
  if (dragUp) {
    CMainMenu_PreviousItem(Menu);
  }
  if (btnA) {
    //playGoodSound();
    switch (CMainMenu_GetSelection(Menu)) {
      case 1:
        GameState = GSDIFFICULTYSELECTINIT;
        break;
      case 2:
        GameState = GSCREDITSInit;
        break;
    }
  }
  CMainMenu_Draw(Menu);
}

//---------------------------------------------------------------------------------
//difficultyselect
//---------------------------------------------------------------------------------
function DifficultySelectInit() {}

// Main difficulty select loop
function DifficultySelect() {
  if (GameState == GSDIFFICULTYSELECTINIT) {
    DifficultySelectInit();
    GameState -= GSINITDIFF;
  }
  if (btnA) {
    GameState = GSGAMEINIT;
  }
  if (dragLeft) {
    if (Difficulty == VERYHARD) {
      Difficulty = HARD;
    } else if (Difficulty == HARD) {
      Difficulty = EASY;
    } else if (Difficulty == EASY) {
      Difficulty = VERYEASY;
    } else if (Difficulty == VERYEASY) {
      Difficulty = VERYHARD;
    }
  }
  if (dragRight) {
    if (Difficulty == VERYEASY) {
      Difficulty = EASY;
    } else if (Difficulty == EASY) {
      Difficulty = HARD;
    } else if (Difficulty == HARD) {
      Difficulty = VERYHARD;
    } else if (Difficulty == VERYHARD) {
      Difficulty = VERYEASY;
    }
  }
  // decide what we draw to the buffer based on the difficuly
  let w;
  switch (Difficulty) {
    case VERYEASY:
      g.drawImage(IMGVERYEASYINFO, 0, 0);
      break;
    case EASY:
      g.drawImage(IMGEASYINFO, 0, 0);
      break;
    case HARD:
      g.drawImage(IMGHARDINFO, 0, 0);
      break;
    case VERYHARD:
      g.drawImage(IMGVERYHARDINFO, 0, 0);
      break;
  }
}

//---------------------------------------------------------------------------------
//Credits
//---------------------------------------------------------------------------------
function CreditsInit() {}

//Main Credits loop, will just show an image and wait for a button to be pressed
function Credits() {
  if (GameState == GSCREDITSInit) {
    CreditsInit();
    GameState -= GSINITDIFF;
  }
  if (btnA || btnB) {
    GameState = GSTITLESCREENINIT;
  }
  g.drawImage(IMGCREDITS, 0, 0);
}

//---------------------------------------------------------------------------------
//Game & Game loop
//---------------------------------------------------------------------------------
// Load the settings, if there isn't a settings file, set some initial values
function LoadSettings() {
  let SettingsFile;
  SettingsFile = pd.file.open("settings.dat", kFileReadData);
  if (SettingsFile) {
    pd.file.read(SettingsFile, BestPegsLeft[VERYEASY], sizeof(int));
    pd.file.read(SettingsFile, BestPegsLeft[EASY], sizeof(int));
    pd.file.read(SettingsFile, BestPegsLeft[HARD], sizeof(int));
    pd.file.read(SettingsFile, BestPegsLeft[VERYHARD], sizeof(int));
    let tmp;
    pd.file.read(SettingsFile, tmp, sizeof(int));
    setSoundOn(tmp);
    pd.file.read(SettingsFile, tmp, sizeof(int));
    setMusicOn(tmp);
    pd.file.close(SettingsFile);
  } else {
    BestPegsLeft[VERYEASY] = 0;
    BestPegsLeft[EASY] = 0;
    BestPegsLeft[HARD] = 0;
    BestPegsLeft[VERYHARD] = 0;
    setSoundOn(true);
    setMusicOn(true);
  }
}

// Save the settings
function SaveSettings() {
  let SettingsFile;
  SettingsFile = pd.file.open("settings.dat", kFileWrite);
  if (SettingsFile) {
    pd.file.write(SettingsFile, BestPegsLeft[VERYEASY], sizeof(int));
    pd.file.write(SettingsFile, BestPegsLeft[EASY], sizeof(int));
    pd.file.write(SettingsFile, BestPegsLeft[HARD], sizeof(int));
    pd.file.write(SettingsFile, BestPegsLeft[VERYHARD], sizeof(int));
    let tmp = isSoundOn();
    pd.file.write(SettingsFile, tmp, sizeof(int));
    tmp = isMusicOn();
    pd.file.write(SettingsFile, tmp, sizeof(int));
    pd.file.close(SettingsFile);
  }
}

//procedure that starts the movesLeftIter function using an interval to loop over
//all pegs
function movesLeft() {
  if(movesLeftTimer)
    clearInterval(movesLeftTimer);
  movesLeftCount = 0;
  pegsLeft = 0;
  movesLeftX = 0;
  movesLeftY = 0;
  movesLeftTimer = setInterval(movesLeftIter, 0);
}

// procedure that calculates how many moves are possible in the current board state for 1 Peg
// we can simply do this by checking all parts and see if they can move to all directions
// the canmoveto method in CPegs is does all the checking
function movesLeftIter() {
  "compiled";
  // if there is a boardpart on that X,Y Coordinate
  // check all direction if we can move to that if so increases the movesleft
  if (BoardParts.Items[movesLeftY][movesLeftX]) {
    if (BoardParts.Items[movesLeftY][movesLeftX].AnimPhase < 2) {
      pegsLeft++;
      movesLeftCount += CPeg_CanMoveTo(BoardParts.Items[movesLeftY][movesLeftX], movesLeftX + 2, movesLeftY, false);
      movesLeftCount += CPeg_CanMoveTo(BoardParts.Items[movesLeftY][movesLeftX], movesLeftX - 2, movesLeftY, false);
      movesLeftCount += CPeg_CanMoveTo(BoardParts.Items[movesLeftY][movesLeftX], movesLeftX, movesLeftY - 2, false);
      movesLeftCount += CPeg_CanMoveTo(BoardParts.Items[movesLeftY][movesLeftX], movesLeftX, movesLeftY + 2, false);
      movesLeftCount += CPeg_CanMoveTo(BoardParts.Items[movesLeftY][movesLeftX], movesLeftX + 2, movesLeftY - 2, false);
      movesLeftCount += CPeg_CanMoveTo(BoardParts.Items[movesLeftY][movesLeftX], movesLeftX + 2, movesLeftY + 2, false);
      movesLeftCount += CPeg_CanMoveTo(BoardParts.Items[movesLeftY][movesLeftX], movesLeftX - 2, movesLeftY + 2, false);
      movesLeftCount += CPeg_CanMoveTo(BoardParts.Items[movesLeftY][movesLeftX], movesLeftX - 2, movesLeftY - 2, false);
    }
  }
  movesLeftX++;
  if(movesLeftX == NROFCOLS)
  {
    movesLeftY++;
    if((movesLeftY == NROFROWS) && (movesLeftX == NROFCOLS))
    {
      clearInterval(movesLeftTimer);
      prevMovesLeftCount = movesLeftCount;
      prevPegsLeft = pegsLeft;
      if(GameState == GSGAME)
        loop();
      return;
    }
    movesLeftX = 0;
  }
}

// procedure that draws the board, boardparts info and a boxed message over the playfield
// and waits till the A button is pressed
function PrintForm(msg) {
  PrintFormShown = true;
  let bg = g.getBgColor();
  let fg = g.getColor();
  g.setColor(bg);
  g.fillRect(3, 5 + 32, 3 + 172, 5 + 80 + 32);
  g.setColor(fg);
  g.drawRect(3, 5 + 32, 3 + 172, 5 + 80 + 32);
  g.drawRect(5, 7 + 32, 173, 7 + 76 + 32);
  g.drawString(msg, 8, 9 + 32);
}

// this will ceate the initial board state, io a cross of pegs, with the middle on being empty (=animphase 6)
function InitBoard() {
  "compiled";
  CBoardParts_RemoveAll(BoardParts);
  let X, Y;
  for (Y = 0; Y < NROFROWS; Y++) {
    for (X = 0; X < NROFCOLS; X++) {
      if ((Y < 3) && (X > 2) && (X < 6)) {
        CBoardParts_Add(BoardParts, CPeg_Create(X, Y));
      }
      if ((Y > 2) && (Y < 6)) {
        CBoardParts_Add(BoardParts, CPeg_Create(X, Y));
      }
      if ((Y > 5) && (X > 2) && (X < 6)) {
        CBoardParts_Add(BoardParts, CPeg_Create(X, Y));
      }
    }
  }
  CBoardParts_GetPart(BoardParts, 4, 4).AnimPhase = 6;
}

// Checks if we won the game
function IsWinningGame(pl) {
  if (pl == 1) {
    //must be 1 peg left
    if (Difficulty == VERYHARD || Difficulty == EASY) {
      if (CBoardParts_GetPart(BoardParts, 4, 4).AnimPhase < 2) {
        // must be in the middle with veryhard or easy
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  } else {
    return false;
  }
}

function setupGame() {
  g.setFont("4x6:2");
  GameState = GSTITLESCREENINIT;
  //LoadSettings();
  BoardParts = CBoardParts_Create();
  Menu = CMainMenu_Create();
  GameSelector = CSelector_Create(4, 4);
}

function loop() {
  let startTime = Date().getTime();
  g.setColor(g.theme.fg);
  g.setBgColor(g.theme.bg);
  needRedraw = 0;
  let prevGameState = GameState;
  switch (GameState) {
    case GSGAMEINIT:
    case GSGAME:
      Game();
      break;
    case GSTITLESCREENINIT:
    case GSTITLESCREEN:
      TitleScreen();
      break;
    case GSDIFFICULTYSELECTINIT:
    case GSDIFFICULTYSELECT:
      DifficultySelect();
      break;
    case GSCREDITSInit:
    case GSCREDITS:
      Credits();
      break;
    default:
      break;
  }
  g.flip();
  if ((GameState != prevGameState) && (GameState >= GSINITDIFF))
    needRedraw = 1;
  if (DEBUGMODESPEED)
    debugLog("loop done: " + (Date().getTime() - startTime).toString());
  else
    debugLog("loop done");

  if (DEBUGMODERAMUSE) {
    let memTmp = process.memory(false);
    let used = memTmp.usage - memStart.usage;
    debugLog("Udiff:" + used.toString() + " used:" + memTmp.usage.toString() + " free:" + memTmp.free.toString() + " total:" + memTmp.total.toString());
  }
}

function debugLog(val) {
  if (DEBUGMODE)
    print(val);
}

function handleTouch(button, data) {
  const offsetvalue = 0.20;
  let x1 = g.getWidth() * offsetvalue;
  let x2 = g.getWidth() - g.getWidth() * offsetvalue;
  let y1 = Bangle.appRect.y + g.getHeight() * offsetvalue;
  let y2 = g.getHeight() - g.getHeight() * offsetvalue;
  dragLeft = data.x < x1;
  dragRight = data.x > x2;
  dragUp = data.y < y1;
  dragDown = data.y > y2;
  btnA = ((data.x <= x2) && (data.x >= x1) && (data.y >= y1) && (data.y <= y2) && (data.type == 0));
  btnB = ((data.x <= x2) && (data.x >= x1) && (data.y >= y1) && (data.y <= y2) && (data.type == 2));
  if (DEBUGMODEINPUT) {
    debugLog("tap button:" + button.toString() + " x:" + data.x.toString() + " y:" + data.y.toString() + " x1:" + x1.toString() + " x2:" + x2.toString() + " y1:" + y1.toString() + " y2:" + y2.toString() + " type:" + data.type.toString());
    debugLog("l:" + dragleft.toString() + " u:" + dragup.toString() + " r:" + dragright.toString() + " d:" + dragdown.toString() + " a:" + btna.toString() + " b:" + btnb.toString());
  }
  loop();
  dragLeft = false;
  dragRight = false;
  dragDown = false;
  dragUp = false;
  btnA = false;
  btnB = false;
  while (needRedraw)
    loop();
  if (DEBUGMODEINPUT)
    debugLog("handleTouch done");
}

function btnPressed() {
  dragLeft = false;
  dragRight = false;
  dragDown = false;
  dragUp = false;
  btnA = false;
  btnB = true;
  loop();
  btnb = false;
  while (needRedraw)
    loop();
  if (DEBUGMODEINPUT)
    debugLog("btnPressed done");
}

setupGame();
loop();
while (needRedraw)
  loop();

//for handling input
Bangle.on('touch', handleTouch);
setWatch(btnPressed, BTN, {
  edge: "rising",
  debounce: 50,
  repeat: true
});