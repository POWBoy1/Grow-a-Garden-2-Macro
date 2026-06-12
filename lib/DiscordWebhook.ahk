/**
 * Sends a player status update to a Discord webhook with an optional screenshot.
 * @param {String} statusTitle 
 * @param {Number|String} statusColor - Hex color (e.g., 0xe67e22)
 * @param {String} statusDescription 
 * @param {Boolean} Mentions 
 * @param {String} content 
 * @param {Boolean|Ptr} statusImage - True to capture Roblox, False for no image, or a pBitmap pointer.
 * @param {Boolean} statusTimestamp 
 */
PlayerStatus(statusTitle, statusColor, statusDescription := "", Mentions := true, content := "", statusImage := true, statusTimestamp := true) {
    url := IniRead(settingsFile, "Settings", "url", "")
    if (url == "")
        return

    _SafeDeleteFile("ss.jpg")

    discordUserId := IniRead(settingsFile, "Settings", "discordID", "")
    mentionStr := Mentions ? "<@" discordUserId ">" : ""
    timestampStr := statusTimestamp ? '"timestamp": "' FormatTime(A_NowUTC, "yyyy-MM-ddTHH:mm:ssZ") '", ' : ""

    hasImage := false
    if (statusImage == true) {
        hasImage := _CaptureRobloxScreenshot("ss.jpg")
    } else if (statusImage != false && statusImage != "") {
        Gdip_SaveBitmapToFile(statusImage, "ss.jpg")
        Gdip_DisposeImage(statusImage)
        hasImage := true
    }

    imageJson := hasImage ? '"image": {"url": "attachment://ss.jpg"}' : ""
    
    payload_json := '{'
        . '"content": "' content ' ' mentionStr '",'
        . '"embeds": [{ '
            . '"title": "' statusTitle '",'
            . '"description": "' statusDescription '",'
            . '"color": ' (statusColor + 0) ','
            . timestampStr
            . imageJson
        . '}]'
    . '}'

    payload_json := RegExReplace(payload_json, ",\s*\}", "}") 

    objParam := Map("payload_json", payload_json)
    if (hasImage) {
        objParam["file"] := ["ss.jpg"]
    }

    try {
        CreateFormDataClass(&postdata, &hdr_ContentType, objParam)
        
        webhook := ComObject("WinHttp.WinHttpRequest.5.1")
        webhook.Open("POST", url, true)
        webhook.SetRequestHeader("User-Agent", "AHK")
        webhook.SetRequestHeader("Content-Type", hdr_ContentType)
        webhook.Send(postdata)
        webhook.WaitForResponse()
        
        _SafeDeleteFile("ss.jpg")
    } catch {
        return
    }
}


/**
 * Captures the Roblox client window and saves it to a file.
 * @param {String} filename 
 * @returns {Boolean} Success state
 */
_CaptureRobloxScreenshot(filename) {
    try {
        pToken := Gdip_Startup()
        hwnd := GetRobloxHWND()
        GetRobloxClientPos(hwnd)
        
        screenParam := (windowWidth > 0) ? (windowX "|" windowY "|" windowWidth "|" windowHeight) : 0
        pBitmap := Gdip_BitmapFromScreen(screenParam)
        
        Gdip_SaveBitmapToFile(pBitmap, filename)
        Gdip_DisposeImage(pBitmap)
        Gdip_Shutdown(pToken)
        return true
    } catch {
        return false
    }
}

/**
 * Safely deletes a file without throwing unhandled exceptions.
 * @param {String} filename 
 */
_SafeDeleteFile(filename) {
    try {
        if FileExist(filename)
            FileDelete(filename)
    }
}