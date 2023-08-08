chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.BkgMsg.Name) {
                case 'CheckSchema':
                        sendResponse({CheckBack: 'ok'})
                        CheckSchemaByContentJs(
                request.BkgMsg.SchemaArgs.From,
                request.BkgMsg.SchemaArgs.DownUrl,
                request.BkgMsg.SchemaArgs.FailJumpUrl
            );
            break;
    }
});
function CheckSchemaByContentJs(from, down_url, fail_jump_url = down_url)
{
        let cmd_url = new URL('Chamongo://');
    cmd_url.searchParams.append('Action', 'AddNewTask');
    cmd_url.searchParams.append('Mode', 'Simple');
    cmd_url.searchParams.append('From', from);
    cmd_url.searchParams.append('Url', down_url);
    let schema = cmd_url.href
    window.protocolCheck(
                schema,
                function () {
                        chrome.storage.local.set(
                {
                    'SchemaAvailable': false
                }
            ).then(() =>
                {
                                        chrome.runtime.sendMessage(
                        {
                            CheckMsg: {
                                Name: 'ContextMenuSetting',
                                ContextMenuArgs: {
                                    Available: false
                                }
                            }
                        },
                        function () {
                            console.log(`check: 'bkg' has gotten 'ContextMenuSetting' request!`);
                        });
                                        if (fail_jump_url !== '')
                    {
                                                chrome.runtime.sendMessage(
                            {
                                CheckMsg: {
                                    Name: 'OpenNewUrl',
                                    Url: fail_jump_url
                                }
                            },
                            function () {
                                console.log(`check: 'bkg' has gotten 'OpenNewUrl' request!`);
                            });
                    }
                }
            )
        },
                function () {
                        chrome.storage.local.set(
                {
                    'SchemaAvailable': true
                }
            ).then(() =>
                {
                                        chrome.runtime.sendMessage(
                        {
                            CheckMsg: {
                                Name: 'ContextMenuSetting',
                                ContextMenuArgs: {
                                    Available: true
                                }
                            }
                        },
                        function () {
                            console.log(`check: 'bkg' has gotten 'ContextMenuSetting' request!`);
                        });
                }
            )
        },
                function () {
        }
    )
}
function GetCenterText(str, left_str, right_str)
{
    try
    {
        let result = ''
                if (left_str === '' && right_str !== '')
        {
            result = str.substring(0, str.indexOf(right_str) - 1)
        }
                else if (left_str !== '' && right_str === '')
        {
            result = str.substring(str.indexOf(left_str) + left_str.length)
        }
                else if (left_str !== '' && right_str !== '')
        {
            let start_index = str.indexOf(left_str) + left_str.length
            let end_index = start_index + str.substring(start_index).indexOf(right_str) - 1
            result = str.substring(start_index, end_index - start_index + 1)
        }
                else
        {
            result = ''
        }
        return result
    }
    catch (e)
    {
        return ''
    }
}