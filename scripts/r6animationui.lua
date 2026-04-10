save = nil

function c3(p1, p2, p3)
    return Color3.new(p1 / 255, p2 / 255, p3 / 255)
end

if not save then
    local v4 = {
        ui = {
            highlightcolor = c3(33, 122, 255),
            errorcolor = c3(255, 0, 0),
            core = c3(65, 65, 65),
            idle = c3(134, 200, 230),
            movement = c3(114, 230, 121),
            action = c3(235, 235, 235),
        },
        preferences = {},
        custom_animations = {
            template = {
                Title = '',
                AnimationId = 'rbxassetid://',
                Image = 'rbxassetid://2151539455',
                Speed = 1,
                Time = 0,
                Weight = 1,
                Loop = false,
                R6 = true,
                Priority = 2,
            },
        },
    }

    save = v4
end

lp = game:GetService('Players').LocalPlayer
m = lp:GetMouse()

function getHumanoid()
    if lp.Character then
        return lp.Character:FindFirstChildWhichIsA('Humanoid')
    else
        return nil
    end
end

screengui = game:GetObjects('rbxassetid://17253025043')[1]
screengui.Parent = game:GetService('CoreGui')
main = screengui.Topbar.Main
mainframe = main.MainFrame
scrollframe = mainframe.ScrollingFrame
items = scrollframe.Items
search = scrollframe.SearchFrame.Search
searchbutton = scrollframe.SearchFrame.ImageLabel.TextButton
searchframe = scrollframe.SearchFrame
preview = main.Preview
previewimage = preview.Image
previewtitle = preview.Title
previewdesc = preview.Desc

function draggable(p5)
    local _UserInputService = game:GetService('UserInputService')
    local u7 = p5
    local u8 = nil
    local u9 = nil
    local u10 = nil
    local u11 = nil

    local function u14(p12)
        local v13 = p12.Position - u10

        u7.Position = UDim2.new(u11.X.Scale, u11.X.Offset + v13.X, u11.Y.Scale, u11.Y.Offset + v13.Y)
    end

    u7.InputBegan:Connect(function(p15)
        if p15.UserInputType == Enum.UserInputType.MouseButton1 or p15.UserInputType == Enum.UserInputType.Touch then
            u8 = true
            u10 = p15.Position
            u11 = u7.Position

            p15.Changed:Connect(function()
                if p15.UserInputState == Enum.UserInputState.End then
                    u8 = false
                end
            end)
        end
    end)
    u7.InputChanged:Connect(function(p16)
        if p16.UserInputType == Enum.UserInputType.MouseMovement or p16.UserInputType == Enum.UserInputType.Touch then
            u9 = p16
        end
    end)
    _UserInputService.InputChanged:Connect(function(p17)
        if p17 == u9 and u8 then
            u14(p17)
        end
    end)
end

function tween(object, goal, callback, tweenin)
    local t = game:GetService("TweenService"):Create(object, tweenin or TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), goal)
    t.Completed:Connect(callback or function() end)
    t:Play()
    return t
end

draggable(screengui.Topbar)

function checkIfStudio()
    return game.Name ~= 'Game'
end

if not checkIfStudio() then
    print('Client is not in Roblox studio')
end

search.Changed:connect(function(p24)
    local v25, v26, v27 = pairs(items:GetChildren())
    local v28 = 0

    while true do
        local v29

        v27, v29 = v25(v26, v27)

        if v27 == nil then
            break
        end
        if v29:IsA('TextButton') and not string.find(v29.Title.Text:lower(), search.Text:lower()) then
            v29.Visible = false
        elseif v29:IsA('TextButton') and string.find(v29.Title.Text:lower(), search.Text:lower()) then
            v29.Visible = true
            v28 = v28 + 1
        end
    end

    if p24 == 'Text' then
        if v28 > 0 then
            tween(searchframe, 'Sine', 'Out', 0.25, {
                BorderColor3 = save.ui.highlightcolor,
            })
            wait(0.25)
            tween(searchframe, 'Sine', 'In', 0.5, {
                BorderColor3 = c3(58, 58, 58),
            })
        else
            tween(searchframe, 'Sine', 'Out', 0.25, {
                BorderColor3 = save.ui.errorcolor,
            })
            wait(0.25)
            tween(searchframe, 'Sine', 'In', 0.5, {
                BorderColor3 = c3(58, 58, 58),
            })
        end
    end
end)
spawn(function()
    while wait(10) do end
end)

cam = workspace.CurrentCamera
running = {}
popAnims = {
    armturbine = {
        Title = 'Arm Turbine',
        AnimationId = 'rbxassetid://259438880',
        Speed = 1.5,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    weirdsway = {
        Title = 'Weird Sway',
        AnimationId = 'rbxassetid://248336677',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    weirdfloat = {
        Title = 'Weird Float',
        AnimationId = 'rbxassetid://248336459',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    weirdpose = {
        Title = 'Weird Pose',
        AnimationId = 'rbxassetid://248336163',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    penguinslide = {
        Title = 'Penguin Slide',
        AnimationId = 'rbxassetid://282574440',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    scream = {
        Title = 'Scream',
        AnimationId = 'rbxassetid://180611870',
        Speed = 1.5,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    crouch = {
        Title = 'Crouch',
        AnimationId = 'rbxassetid://182724289',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    happydance = {
        Title = 'Happy Dance',
        AnimationId = 'rbxassetid://248335946',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    floatinghead = {
        Title = 'Floating Head',
        AnimationId = 'rbxassetid://121572214',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    balloonfloat = {
        Title = 'Balloon Float',
        AnimationId = 'rbxassetid://148840371',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    pinchnose = {
        Title = 'Pinch Nose',
        AnimationId = 'rbxassetid://30235165',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    goal = {
        Title = 'Goal!',
        AnimationId = 'rbxassetid://28488254',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    cry = {
        Title = 'Cry',
        AnimationId = 'rbxassetid://180612465',
        Speed = 0,
        Time = 1.5,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    partytime = {
        Title = 'Party Time',
        AnimationId = 'rbxassetid://33796059',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    moondance = {
        Title = 'Moon Dance',
        AnimationId = 'rbxassetid://27789359',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    insanelegs = {
        Title = 'Insane Legs',
        AnimationId = 'rbxassetid://87986341',
        Speed = 99,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    rotation = {
        Title = 'Rotation',
        AnimationId = 'rbxassetid://136801964',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    insanerotation = {
        Title = 'Insane Rotation',
        AnimationId = 'rbxassetid://136801964',
        Speed = 99,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    roar = {
        Title = 'Roar',
        AnimationId = 'rbxassetid://163209885',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    spin = {
        Title = 'Spin',
        AnimationId = 'rbxassetid://188632011',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    zombiearms = {
        Title = 'Zombie Arms',
        AnimationId = 'rbxassetid://183294396',
        Speed = 0,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    insane = {
        Title = 'Insane',
        AnimationId = 'rbxassetid://33796059',
        Speed = 99,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    neckbreak = {
        Title = 'Neck Break',
        AnimationId = 'rbxassetid://35154961',
        Speed = 0,
        Time = 2,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    headdetach = {
        Title = 'Head Detach',
        AnimationId = 'rbxassetid://35154961',
        Speed = 0,
        Time = 3,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    idle = {
        Title = 'Idle',
        AnimationId = 'rbxassetid://180435571',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    charleston = {
        Title = 'Charleston',
        AnimationId = 'rbxassetid://429703734',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    dab = {
        Title = 'Dab',
        AnimationId = 'rbxassetid://248263260',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    dab2 = {
        Title = 'Dab2',
        AnimationId = 'rbxassetid://183412246',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    punches = {
        Title = 'Punches',
        AnimationId = 'rbxassetid://126753849',
        Speed = 1.5,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    faint = {
        Title = 'Faint',
        AnimationId = 'rbxassetid://181525546',
        Speed = 1.5,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    Beatbox = {
        Title = 'Beatbox',
        AnimationId = 'rbxassetid://45504977',
        Speed = 2,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    dinostomp = {
        Title = 'Dino Stomp',
        AnimationId = 'rbxassetid://204328711',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    hold = {
        Title = 'Hold',
        AnimationId = 'rbxassetid://161268368',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    hold2 = {
        Title = 'Hold2',
        AnimationId = 'rbxassetid://225975820',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    armthrow = {
        Title = 'Arm Throw',
        AnimationId = 'rbxassetid://33169583',
        Speed = 0,
        Time = 9,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    heroland = {
        Title = 'Hero Land',
        AnimationId = 'rbxassetid://184574340',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    swingpunch = {
        Title = 'Swing Punch',
        AnimationId = 'rbxassetid://204062532',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    swingsword = {
        Title = 'Swing Sword',
        AnimationId = 'rbxassetid://218504594',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    levitate = {
        Title = 'Levitate',
        AnimationId = 'rbxassetid://313762630',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    spindance = {
        Title = 'Spin Dance',
        AnimationId = 'rbxassetid://429730430',
        Speed = 1.5,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    jumpingjacks = {
        Title = 'Jumping Jacks',
        AnimationId = 'rbxassetid://429681631',
        Speed = 1.5,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    strikegrab = {
        Title = 'Strike Grab',
        AnimationId = 'rbxassetid://204295235',
        Speed = 1.5,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    teleportation = {
        Title = 'Teleportation',
        AnimationId = 'rbxassetid://215384594',
        Speed = 5,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    fastspin = {
        Title = 'Fast Spin',
        AnimationId = 'rbxassetid://188632011',
        Speed = 5,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    tpose = {
        Title = 'T-Pose',
        AnimationId = 'rbxassetid://27432686',
        Speed = 0,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    laydown = {
        Title = 'Lay Down',
        AnimationId = 'rbxassetid://181525546',
        Speed = 0,
        Time = 5,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    laugh = {
        Title = 'Laugh',
        AnimationId = 'rbxassetid://129423131',
        Speed = 1.25,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    cheer = {
        Title = 'Cheer',
        AnimationId = 'rbxassetid://129423030',
        Speed = 1.25,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    wave = {
        Title = 'Wave',
        AnimationId = 'rbxassetid://128777973',
        Speed = 1.25,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    point = {
        Title = 'Point',
        AnimationId = 'rbxassetid://128853357',
        Speed = 1.25,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    heil = {
        Title = 'Heil',
        AnimationId = 'rbxassetid://74863286',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    fall = {
        Title = 'Fall',
        AnimationId = 'rbxassetid://180436148',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    sit = {
        Title = 'Sit',
        AnimationId = 'rbxassetid://178130996',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    lunge = {
        Title = 'Lunge',
        AnimationId = 'rbxassetid://129967478',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    walk = {
        Title = 'Walk',
        AnimationId = 'rbxassetid://180426354',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    jump = {
        Title = 'Jump',
        AnimationId = 'rbxassetid://125750702',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
    monstermash = {
        Title = 'Monster Mash',
        AnimationId = 'rbxassetid://35654637',
        Speed = 1,
        Time = 0,
        Weight = 1,
        Loop = true,
        R6 = true,
        Priority = 2,
    },
}
robloxOwns = {}
ownerOwns = {}
customAnims = {}

function getOwnedAnimations(p30)
    return game:GetService('HttpService'):GetAsync('https://inventory.roblox.com/v1/users/' .. p30 .. '/inventory/Animation?pageNumber=1&itemsPerPage=10', true)
end
function getAnim(p31)
    return popAnims[p31] or customAnims[p31]
end
function runAnim(p32, p33)
    local _Animation = Instance.new('Animation')

    _Animation.AnimationId = p32.AnimationId

    local u35 = p33:LoadAnimation(_Animation)

    table.insert(running, u35)

    u35.Priority = p32.Priority
    u35.Looped = p32.Loop

    local v36 = u35

    u35.Play(v36)

    local v37 = u35

    u35.AdjustSpeed(v37, p32.Speed)

    local v38 = u35

    u35.AdjustWeight(v38, p32.Weight)

    u35.TimePosition = p32.Time

    u35.Stopped:connect(function()
        for v39 = 1, #running do
            if running[v39] == u35 then
                table.remove(running, v39)
            end
        end
    end)

    return u35
end

template = items.Template
template.Parent = nil

function clear()
    local v40, v41, v42 = pairs(items:GetChildren())

    while true do
        local v43

        v42, v43 = v40(v41, v42)

        if v42 == nil then
            break
        end
        if v43:IsA('TextButton') then
            v43:Destroy()
        end
    end
end
function createbutton(p44)
    local u45 = template:Clone()

    u45.Parent = items
    u45.Name = p44.Title
    u45.Title.Text = p44.Title
    u45.Image.Image = p44.Image or 'rbxassetid://2151539455'

    if u45.Image.Image ~= 'rbxassetid://2151539455' then
        u45.Image.ImageColor3 = Color3.new(1, 1, 1)
    else
        local _Image = u45.Image
        local v47 = p44.Priority == 0 and save.ui.idle or (p44.Priority == 1 and save.ui.movement or p44.Priority == 2 and save.ui.action)

        if not v47 then
            if p44.Priority ~= 1000 then
                v47 = false
            else
                v47 = save.ui.core
            end
        end

        _Image.ImageColor3 = v47
    end

    u45.LayoutOrder = math.random(1, 10000)
    u45.Settings.AnimationId.Value = p44.AnimationId
    u45.Settings.Loop.Value = p44.Loop
    u45.Settings.Priority.Value = p44.Priority
    u45.Settings.R6.Value = p44.R6
    u45.Settings.Speed.Value = p44.Speed
    u45.Settings.Weight.Value = p44.Weight
    u45.Settings.Time.Value = p44.Time

    u45.MouseEnter:connect(function()
        preview.Title.Text = p44.Title
        preview.Desc.Text = 'Speed: ' .. tostring(p44.Speed) .. '\nPriority: ' .. tostring(p44.Priority) .. '\nR6 Rig: ' .. tostring(p44.R6) .. '\nAnimID: ' .. tostring(p44.AnimationId) .. '\n\n' .. (p44.Description or 'No description provided')
        preview.Image.Image = p44.Image or 'rbxassetid://2151539455'

        if preview.Image.Image ~= 'rbxassetid://2151539455' then
            preview.Image.ImageColor3 = Color3.new(1, 1, 1)
        else
            local _Image2 = preview.Image
            local v49 = p44.Priority == 0 and save.ui.idle or (p44.Priority == 1 and save.ui.movement or p44.Priority == 2 and save.ui.action)

            if not v49 then
                if p44.Priority ~= 1000 then
                    v49 = false
                else
                    v49 = save.ui.core
                end
            end

            _Image2.ImageColor3 = v49
        end
    end)
    u45.MouseButton1Click:connect(function()
        u45.Border.ImageColor3 = save.ui.highlightcolor

        local v50, v51, v52 = pairs(running)

        while true do
            local v53

            v52, v53 = v50(v51, v52)

            if v52 == nil then
                break
            end
            if v53.Animation.AnimationId == p44.AnimationId then
                v53:Stop()

                return
            end
        end

        u45.Border.Visible = true

        runAnim(p44, getHumanoid()).Stopped:connect(function()
            u45.Border.Visible = false
        end)
    end)

    return u45
end

dropdown = mainframe.ScrollingFrame.DropdownFrame
elements = dropdown.HoldContentsFrame.Frame.Elements
dropdownenabled = true

tween(dropdown.HoldContentsFrame.Frame, {Position = UDim2.new(0, 0, -1, 0)}, nil, TweenInfo.new(0, Enum.EasingStyle.Linear, Enum.EasingDirection.In))

dropdown.HoldContentsFrame.Frame.Visible = false
dropdowndeactivate = screengui.DropdownDeactivate
dropdowndeactivate.Visible = false

function hideddown()
    tween(dropdown.HoldContentsFrame.Frame, 'Linear', 'In', 0, {
        Position = UDim2.new(0, 0, -1, 0),
    })

    dropdown.HoldContentsFrame.Frame.Visible = false
    dropdowndeactivate.Visible = false
    dropdownenabled = true

    local v54, v55, v56 = pairs(elements:GetChildren())

    while true do
        local v57

        v56, v57 = v54(v55, v56)

        if v56 == nil then
            break
        end
        if v57:IsA('TextButton') then
            v57.BackgroundColor3 = c3(46, 46, 46)
        end
    end
end

dropdown.MouseButton1Click:connect(function()
    print('ddownclick')

    dropdownenabled = not dropdownenabled

    if dropdownenabled then
        hideddown()
    else
        tween(dropdown.HoldContentsFrame.Frame, 'Linear', 'In', 0.3, {
            Position = UDim2.new(0, 0, 0, 0),
        })

        dropdown.HoldContentsFrame.Frame.Visible = true
        dropdowndeactivate.Visible = true
    end
end)
dropdowndeactivate.MouseButton1Down:connect(function()
    hideddown()
end)

local v58, v59, v60 = pairs(elements:GetChildren())

while true do
    local u61

    v60, u61 = v58(v59, v60)

    if v60 == nil then
        break
    end
    if u61:IsA('TextButton') then
        u61.MouseEnter:connect(function()
            local v62, v63, v64 = pairs(elements:GetChildren())

            while true do
                local v65

                v64, v65 = v62(v63, v64)

                if v64 == nil then
                    break
                end
                if v65:IsA('TextButton') then
                    v65.BackgroundColor3 = c3(46, 46, 46)
                end
            end

            u61.BackgroundColor3 = save.ui.highlightcolor
        end)
        u61.MouseButton1Click:connect(function()
            hideddown()

            dropdown.TextLabel.Text = u61.Name

            sort(u61.Name)
        end)
    end
end

function sort(p66)
    clear()

    if p66 == 'Popular' then
        local v67, v68, v69 = pairs(popAnims)

        while true do
            local v70

            v69, v70 = v67(v68, v69)

            if v69 == nil then
                break
            end

            createbutton(v70)
        end
    else
        local _ = not (p66 == 'By Roblox')
    end
end

game:GetService('RunService').RenderStepped:connect(function()
    items.Parent.CanvasSize = UDim2.new(0, 0, 0, items.GridLayout.AbsoluteContentSize.Y + 50)
end)
sort('Popular')
