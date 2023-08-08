chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.CheckMsg.Name) {
                case 'ContextMenuSetting':
                        sendResponse({BkgBack: 'ok'})
                        SetContextMenu(request.CheckMsg.ContextMenuArgs.Available)
            break;
                case 'OpenNewUrl':
                        sendResponse({BkgBack: 'ok'})
                        chrome.tabs.create(
                {
                    url: request.CheckMsg.Url,
                }
            ).then()
            break;
    }
});
chrome.runtime.onInstalled.addListener(async () => {
        chrome.contextMenus.create({
        id: 'DownOneFile',
        title: `使用 Chamongo 下载`,
        type: 'normal',
        contexts: ['link']
    });
});
chrome.contextMenus.onClicked.addListener((item) => {
        let context_id = item.menuItemId
        chrome.storage.local.get(
        ['SchemaAvailable'],
        (result)=>
        {
                        let schema_available = result.SchemaAvailable
                        switch (context_id)
            {
                                case 'DownOneFile':
                                        if (typeof schema_available === typeof undefined)
                    {
                                                StartSchemaCheck(
                            'ContextMenus',
                            item.linkUrl,
                            '../pages/fix_app/fix_app.html'
                        )
                    }
                    else if (schema_available === true)
                    {
                                                LaunchChamongo('ContextMenus', item.linkUrl)
                    }
                    else
                    {
                                                chrome.tabs.create({
                            url: '../pages/fix_app/fix_app.html'
                        }).then()
                    }
                    break
                default:
                            }
        });
});
function SetContextMenu(isAvailable = true)
{
        let result = ''
    if (isAvailable)
    {
        result = '使用 Chamongo 下载'
    }
    else
    {
        result = '* Chamongo 下载不可用（点击修复）'
    }
        chrome.contextMenus.update(
        'DownOneFile',
        {
            title: result
        }
    )
}
function LaunchChamongo(From, Url)
{
        let cmd_url = new URL('Chamongo://');
    cmd_url.searchParams.append('Action', 'AddNewTask');
    cmd_url.searchParams.append('Mode', 'Direct');
    cmd_url.searchParams.append('From', From);
    cmd_url.searchParams.append('Url', Url);
    let schema = cmd_url.href
        chrome.tabs.update({
        url: schema
    }).then()
}
chrome.webNavigation.onBeforeNavigate.addListener((navigate_tab) => {
        if (navigate_tab.url.startsWith('http://') ||
        navigate_tab.url.startsWith('https://') ||
        navigate_tab.url.startsWith('ftp://'))
    {
                if (IsSupportFileType(navigate_tab.url))
        {
                        chrome.storage.sync.get(
                ['ChamongoAgentBrowser'],
                (result)=>
                {
                    let is_agent = result.ChamongoAgentBrowser
                                        if (typeof is_agent === typeof undefined)
                    {
                                                chrome.storage.local.set(
                            {
                                'ChamongoAgentBrowser': true
                            }
                        ).then()
                        is_agent = true
                    }
                                        if (is_agent === true)
                    {
                                                chrome.storage.local.get(
                            ['SchemaAvailable'],
                            (result)=> {
                                                                let schema_available = result.SchemaAvailable
                                                                if (typeof schema_available === typeof undefined)
                                {
                                                                        StartSchemaCheck('UrlAgent', navigate_tab.url)
                                }
                                else if (schema_available === true)
                                {
                                                                        LaunchChamongo('UrlAgent', navigate_tab.url)
                                }
                                else
                                {
                                                                    }
                            });
                    }
                    else
                    {
                                            }
                })
        }
    }
});
function StartSchemaCheck(from, down_url, fail_jump_url = down_url)
{
        chrome.tabs.query({active: true, lastFocusedWindow:true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id,
            {
                BkgMsg: {
                    Name: 'CheckSchema',
                    SchemaArgs: {
                        From: from,
                        DownUrl: down_url,
                        FailJumpUrl: fail_jump_url
                    }
                }
            },
            function () {
                console.log(`bkg: 'check' has gotten 'CheckSchema' request!`);
            });
    });
}
function IsSupportFileType(path)
{
        if (path === '')
    {
        return false
    }
        let file_type = GetFileExtensionName(path)
    if(file_type === '')
    {
        return false
    }
        const audio_type = '|opus|flac|webm|weba|wav|ogg|m4a|mp3|oga|mid|amr|aiff|wma|au|aac|'
    const video_type = '|mp4|avi|wmv|mpg|mpeg|mov|rm|ram|swf|flv|'
        const document_type = '|doc|docx|ppt|pptx|xls|xlsx|txt|pdf'
    const other_type = '|exe|bin|zip|rar|7z|tar|gz|iso|'
    const support_type = audio_type + video_type + document_type + other_type
    if (support_type.indexOf(file_type.toLowerCase()) !== -1)
    {
        return true
    }
    else
    {
        return false
    }
}
function GetFileExtensionName(path)
{
        if(path ==='')
    {
        return ''
    }
        path = path.replace('\\', '/')
        let file_name = path.substring(path.lastIndexOf('/') + 1)
        if(file_name.indexOf('.') !== -1)
    {
        return file_name.substring(file_name.lastIndexOf('.') + 1)
    }
    else
    {
        return ''
    }
}
chrome.runtime.onStartup.addListener(() =>
{
        chrome.storage.local.remove(
        ['SchemaAvailable']
    ).then(() => {
                SetContextMenu()
    })
});
function TipBox(message, title='')
{
    if (title === '')
    {
        title = 'Chamongo 消息通知'
    }
    chrome.notifications.create(
        Math.random() + '',          {
            type: 'basic',
            title: title,
            message: message,
            iconUrl: "../images/logo/chamongo.png",
            eventTime: Date.now() + 2000
        }
    );
}