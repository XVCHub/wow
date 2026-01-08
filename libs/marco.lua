local vu29 = {windowcount = 0}
local vu30 = {}
local vu31 = {}
local vu32 = game:GetService('Players').LocalPlayer:GetMouse()
local vu33 = game:GetService('UserInputService')
local vu34 = game:GetService('RunService').Heartbeat

function vu30.new(pu35)
    local v36, v37 = pcall(function()
        return pu35.MouseEnter
    end)

    if v36 then
        pu35.Active = true

        v37:connect(function()
            local vu40 = pu35.InputBegan:connect(function(p38)
                if p38.UserInputType == Enum.UserInputType.MouseButton1 or p38.UserInputType == Enum.UserInputType.Touch then
                    local v39 = Vector2.new(vu32.X - pu35.AbsolutePosition.X, vu32.Y - pu35.AbsolutePosition.Y)

                    while vu34:wait() and vu33:IsMouseButtonPressed(Enum.UserInputType.MouseButton1) do
                        pu35:TweenPosition(UDim2.new(0, vu32.X - v39.X + pu35.Size.X.Offset * pu35.AnchorPoint.X, 0, vu32.Y - v39.Y + pu35.Size.Y.Offset * pu35.AnchorPoint.Y), 'Out', 'Quad', 0.1, true)
                    end
                end
            end)
            local vu41 = nil

            vu41 = pu35.MouseLeave:connect(function()
                vu40:disconnect()
                vu41:disconnect()
            end)
        end)
    end
end
function vu31.new(pu42, pu43)
    pu42:GetPropertyChangedSignal('AbsoluteSize'):connect(function()
        pu43.Size = UDim2.new(pu43.Size.X.Scale, pu43.Size.X.Offset, pu43.Size.Y.Scale, pu42.AbsoluteSize.Y)
    end)
end

local vu44 = {
    txtcolor = Color3.fromRGB(255, 255, 255),
    underline = Color3.fromRGB(0, 255, 140),
    barcolor = Color3.fromRGB(40, 40, 40),
    bgcolor = Color3.fromRGB(30, 30, 30),
}

function vu29.Create(_, p45, p46)
    local v47 = Instance.new(p45)
    local v48 = next
    local v49 = p46
    local v50 = nil

    while true do
        local v51

        v50, v51 = v48(p46, v50)

        if v50 == nil then
            break
        end
        if v50 ~= 'Parent' then
            v47[v50] = v51
        end
    end

    v47.Parent = v49.Parent

    return v47
end
function vu29.CreateWindow(p52, p53)
    assert(p53.text, 'no name')

    local vu54 = {
        count = 0,
        toggles = {},
        closed = false,
    }
    local vu55 = p53 or {}
    local v56 = {__index = vu44}

    setmetatable(vu55, v56)

    p52.windowcount = p52.windowcount + 1
    vu29.gui = vu29.gui or p52:Create('ScreenGui', {
        Name = 'UILibrary',
        Parent = game:GetService('CoreGui'),
    })
    vu54.frame = p52:Create('Frame', {
        Name = vu55.text,
        Parent = p52.gui,
        Active = true,
        BackgroundTransparency = 0,
        Size = UDim2.new(0, 190, 0, 30),
        Position = UDim2.new(0, 15 + (200 * p52.windowcount - 200), 0, 15),
        BackgroundColor3 = vu55.barcolor,
        BorderSizePixel = 0,
    })
    vu54.background = p52:Create('Frame', {
        Name = 'Background',
        Parent = vu54.frame,
        BorderSizePixel = 0,
        BackgroundColor3 = vu55.bgcolor,
        Position = UDim2.new(0, 0, 1, 0),
        Size = UDim2.new(1, 0, 0, 25),
        ClipsDescendants = true,
    })
    vu54.container = p52:Create('Frame', {
        Name = 'Container',
        Parent = vu54.frame,
        BorderSizePixel = 0,
        BackgroundColor3 = vu55.bgcolor,
        Position = UDim2.new(0, 0, 1, 0),
        Size = UDim2.new(1, 0, 0, 25),
        ClipsDescendants = true,
    })
    vu54.organizer = p52:Create('UIListLayout', {
        Name = 'Sorter',
        SortOrder = Enum.SortOrder.LayoutOrder,
        Parent = vu54.container,
    })
    vu54.padder = p52:Create('UIPadding', {
        Name = 'Padding',
        PaddingLeft = UDim.new(0, 10),
        PaddingTop = UDim.new(0, 5),
        Parent = vu54.container,
    })

    p52:Create('Frame', {
        Name = 'Underline',
        Size = UDim2.new(1, 0, 0, 1),
        Position = UDim2.new(0, 0, 1, -1),
        BorderSizePixel = 0,
        BackgroundColor3 = vu55.underline,
        Parent = vu54.frame,
    })

    local vu57 = p52:Create('TextButton', {
        Name = 'Toggle',
        ZIndex = 2,
        BackgroundTransparency = 1,
        Position = UDim2.new(1, -25, 0, 0),
        Size = UDim2.new(0, 25, 1, 0),
        Text = '-',
        TextSize = 17,
        TextColor3 = vu55.txtcolor,
        Font = Enum.Font.FredokaOne,
        Parent = vu54.frame,
    })

    vu57.MouseButton1Click:connect(function()
        vu54.closed = not vu54.closed
        vu57.Text = vu54.closed and '+' or '-'

        if vu54.closed then
            vu54:Resize(true, UDim2.new(1, 0, 0, 0))
        else
            vu54:Resize(true)
        end
    end)
    p52:Create('TextLabel', {
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundTransparency = 1,
        BorderSizePixel = 0,
        TextColor3 = vu55.txtcolor,
        TextColor3 = vu55.bartextcolor or Color3.fromRGB(255, 255, 255),
        TextSize = 17,
        Font = Enum.Font.FredokaOne,
        Text = vu55.text or 'window',
        Name = 'Window',
        Parent = vu54.frame,
    })
    vu30.new(vu54.frame)
    vu31.new(vu54.background, vu54.container)

    local function vu63()
        local v58 = next
        local v59, v60 = vu54.container:GetChildren()
        local v61 = 0

        while true do
            local v62

            v60, v62 = v58(v59, v60)

            if v60 == nil then
                break
            end
            if not (v62:IsA('UIListLayout') or v62:IsA('UIPadding')) then
                v61 = v61 + v62.AbsoluteSize.Y
            end
        end

        return UDim2.new(1, 0, 0, v61 + 10)
    end

    function vu54.Resize(p64, p65, p66)
        local v67 = p66 or vu63()

        p64.container.ClipsDescendants = true

        if p65 then
            p64.background:TweenSize(v67, 'Out', 'Sine', 0.5, true)
        else
            p64.background.Size = v67
        end
    end
    function vu54.AddToggle(pu68, pu69, p70)
        pu68.count = pu68.count + 1

        local vu71 = p70 or function() end
        local v72 = vu29:Create('TextLabel', {
            Text = pu69,
            Size = UDim2.new(1, -10, 0, 20),
            BackgroundTransparency = 1,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextXAlignment = Enum.TextXAlignment.Left,
            LayoutOrder = pu68.Count,
            TextSize = 14,
            Font = Enum.Font.FredokaOne,
            Parent = pu68.container,
        })
        local vu73 = vu29:Create('TextButton', {
            Text = 'OFF',
            TextColor3 = Color3.fromRGB(255, 25, 25),
            BackgroundTransparency = 1,
            Position = UDim2.new(1, -25, 0, 0),
            Size = UDim2.new(0, 25, 1, 0),
            TextSize = 17,
            Font = Enum.Font.FredokaOne,
            Parent = v72,
        })

        vu73.MouseButton1Click:connect(function()
            pu68.toggles[pu69] = not pu68.toggles[pu69]
            vu73.TextColor3 = pu68.toggles[pu69] and Color3.fromRGB(0, 255, 140) or Color3.fromRGB(255, 25, 25)
            vu73.Text = pu68.toggles[pu69] and 'ON' or 'OFF'

            vu71(pu68.toggles[pu69])
        end)
        pu68:Resize()

        return vu73
    end
    function vu54.AddBox(p74, p75, p76)
        p74.count = p74.count + 1

        local vu77 = p76 or function() end
        local vu78 = vu29:Create('TextBox', {
            PlaceholderText = p75,
            Size = UDim2.new(1, -10, 0, 20),
            BackgroundTransparency = 0.75,
            BackgroundColor3 = vu55.boxcolor,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextXAlignment = Enum.TextXAlignment.Center,
            TextSize = 14,
            Text = '',
            Font = Enum.Font.FredokaOne,
            LayoutOrder = p74.Count,
            BorderSizePixel = 0,
            Parent = p74.container,
        })

        vu78.FocusLost:connect(function(...)
            vu77(vu78, ...)
        end)
        p74:Resize()

        return vu78
    end
    function vu54.AddButton(p79, p80, p81)
        p79.count = p79.count + 1

        local v82 = vu29:Create('TextButton', {
            Text = p80,
            Size = UDim2.new(1, -10, 0, 20),
            BackgroundTransparency = 1,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextXAlignment = Enum.TextXAlignment.Left,
            TextSize = 14,
            Font = Enum.Font.FredokaOne,
            LayoutOrder = p79.Count,
            Parent = p79.container,
        })

        v82.MouseButton1Click:connect(p81 or function() end)
        p79:Resize()

        return v82
    end
    function vu54.AddLabel(p83, p84)
        p83.count = p83.count + 1

        local v85 = game:GetService('TextService'):GetTextSize(p84, 16, Enum.Font.FredokaOne, Vector2.new(math.huge, math.huge))
        local v86 = vu29:Create('TextLabel', {
            Text = p84,
            Size = UDim2.new(1, -10, 0, v85.Y + 5),
            TextScaled = false,
            BackgroundTransparency = 1,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextXAlignment = Enum.TextXAlignment.Left,
            TextSize = 14,
            Font = Enum.Font.FredokaOne,
            LayoutOrder = p83.Count,
            Parent = p83.container,
        })

        p83:Resize()

        return v86
    end
    function vu54.AddDropdown(pu87, pu88, p89)
        pu87.count = pu87.count + 1

        local v90 = pu88[1] or ''
        local vu91 = p89 or function() end
        local vu92 = vu29:Create('TextLabel', {
            Size = UDim2.new(1, -10, 0, 20),
            BackgroundTransparency = 0.75,
            BackgroundColor3 = pu88.boxcolor,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextXAlignment = Enum.TextXAlignment.Center,
            TextSize = 14,
            Text = v90,
            Font = Enum.Font.FredokaOne,
            BorderSizePixel = 0,
            LayoutOrder = pu87.Count,
            Parent = pu87.container,
        })
        local v93 = vu29:Create('ImageButton', {
            BackgroundTransparency = 1,
            Image = 'rbxassetid://3234893186',
            Size = UDim2.new(0, 18, 1, 0),
            Position = UDim2.new(1, -20, 0, 0),
            Parent = vu92,
        })
        local vu94 = nil

        local function vu102(p95)
            local v96 = game:GetService('UserInputService'):GetMouseLocation()
            local v97 = Vector2.new(v96.X, v96.Y - 36)
            local v98 = p95.AbsolutePosition.X
            local v99 = p95.AbsolutePosition.X + p95.AbsoluteSize.X
            local v100 = p95.AbsolutePosition.Y
            local v101 = p95.AbsolutePosition.Y + p95.AbsoluteSize.Y

            return v98 <= v97.X and (v97.X <= v99 and (v100 <= v97.Y and v97.Y <= v101))
        end
        local function vu108(p103)
            local v104 = next
            local v105 = nil
            local v106 = 0

            while true do
                local v107

                v105, v107 = v104(p103, v105)

                if v105 == nil then
                    break
                end

                v106 = v106 + 1
            end

            return v106
        end

        v93.MouseButton1Click:connect(function()
            if vu108(pu88) ~= 0 then
                if vu94 then
                    vu94:Destroy()

                    vu94 = nil
                end

                pu87.container.ClipsDescendants = false
                vu94 = vu29:Create('Frame', {
                    Position = UDim2.new(0, 0, 1, 0),
                    BackgroundColor3 = Color3.fromRGB(0, 255, 255),
                    Size = UDim2.new(0, vu92.AbsoluteSize.X, 0, vu108(pu88) * 21),
                    BorderSizePixel = 0,
                    Parent = vu92,
                    ClipsDescendants = true,
                    ZIndex = 2,
                })

                vu29:Create('UIListLayout', {
                    Name = 'Layout',
                    Parent = vu94,
                })

                local v109 = next
                local v110 = pu88
                local v111 = nil

                while true do
                    local vu112

                    v111, vu112 = v109(v110, v111)

                    if v111 == nil then
                        break
                    end

                    vu29:Create('TextButton', {
                        Text = vu112,
                        BackgroundColor3 = Color3.fromRGB(40, 40, 40),
                        TextColor3 = Color3.fromRGB(255, 255, 255),
                        BorderSizePixel = 0,
                        TextSize = 14,
                        Font = Enum.Font.FredokaOne,
                        Size = UDim2.new(1, 0, 0, 21),
                        Parent = vu94,
                        ZIndex = 2,
                    }).MouseButton1Click:connect(function()
                        vu92.Text = vu112

                        vu91(vu112)

                        vu94.Size = UDim2.new(1, 0, 0, 0)

                        game:GetService('Debris'):AddItem(vu94, 0.1)
                    end)
                end
            end
        end)
        game:GetService('UserInputService').InputBegan:connect(function(p113)
            if p113.UserInputType == Enum.UserInputType.MouseButton1 and (vu94 and not vu102(vu94)) then
                game:GetService('Debris'):AddItem(vu94)
            end
        end)
        vu91(v90)
        pu87:Resize()

        return {
            Refresh = function(_, p114)
                game:GetService('Debris'):AddItem(vu94)

                pu88 = p114
                vu92.Text = pu88[1]
            end,
        }
    end

    return vu54
end
