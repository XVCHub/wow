local LIB = {windowcount = 0}
local DRAG = {}
local RESIZE = {}
local MOUSE = game:GetService('Players').LocalPlayer:GetMouse()
local UIS = game:GetService('UserInputService')
local HEARTBEAT = game:GetService('RunService').Heartbeat

local COLORS = {
    txtcolor = Color3.fromRGB(255, 255, 255),
    underline = Color3.fromRGB(0, 255, 140),
    barcolor = Color3.fromRGB(40, 40, 40),
    bgcolor = Color3.fromRGB(30, 30, 30),
}

function DRAG.new(frame)
    local ok, enter = pcall(function()
        return frame.MouseEnter
    end)

    if ok then
        frame.Active = true

        enter:connect(function()
            local started = frame.InputBegan:connect(function(input)
                if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                    local offset = Vector2.new(MOUSE.X - frame.AbsolutePosition.X, MOUSE.Y - frame.AbsolutePosition.Y)

                    while HEARTBEAT:wait() and UIS:IsMouseButtonPressed(Enum.UserInputType.MouseButton1) do
                        frame:TweenPosition(UDim2.new(0, MOUSE.X - offset.X + frame.Size.X.Offset * frame.AnchorPoint.X, 0, MOUSE.Y - offset.Y + frame.Size.Y.Offset * frame.AnchorPoint.Y), 'Out', 'Quad', 0.1, true)
                    end
                end
            end)
            local left

            left = frame.MouseLeave:connect(function()
                started:disconnect()
                left:disconnect()
            end)
        end)
    end
end

function RESIZE.new(parent, child)
    parent:GetPropertyChangedSignal('AbsoluteSize'):connect(function()
        child.Size = UDim2.new(child.Size.X.Scale, child.Size.X.Offset, child.Size.Y.Scale, parent.AbsoluteSize.Y)
    end)
end

function LIB.Create(_, class, props)
    local obj = Instance.new(class)
    
    for k, v in props do
        if k ~= 'Parent' then
            obj[k] = v
        end
    end

    obj.Parent = props.Parent

    return obj
end

function LIB.CreateWindow(self, config)
    assert(config.text, 'window needs text')

    local WIN = {
        count = 0,
        toggles = {},
        closed = false,
    }
    
    local cfg = config or {}
    setmetatable(cfg, {__index = COLORS})

    self.windowcount += 1
    
    LIB.gui = LIB.gui or self:Create('ScreenGui', {
        Name = 'UILibrary',
        Parent = game:GetService('CoreGui'),
    })
    
    WIN.frame = self:Create('Frame', {
        Name = cfg.text,
        Parent = self.gui,
        Active = true,
        BackgroundTransparency = 0,
        Size = UDim2.new(0, 190, 0, 30),
        Position = UDim2.new(0, 15 + (200 * self.windowcount - 200), 0, 15),
        BackgroundColor3 = cfg.barcolor,
        BorderSizePixel = 0,
    })
    
    WIN.background = self:Create('Frame', {
        Name = 'Background',
        Parent = WIN.frame,
        BorderSizePixel = 0,
        BackgroundColor3 = cfg.bgcolor,
        Position = UDim2.new(0, 0, 1, 0),
        Size = UDim2.new(1, 0, 0, 25),
        ClipsDescendants = true,
    })
    
    WIN.container = self:Create('Frame', {
        Name = 'Container',
        Parent = WIN.frame,
        BorderSizePixel = 0,
        BackgroundColor3 = cfg.bgcolor,
        Position = UDim2.new(0, 0, 1, 0),
        Size = UDim2.new(1, 0, 0, 25),
        ClipsDescendants = true,
    })
    
    WIN.organizer = self:Create('UIListLayout', {
        Name = 'Sorter',
        SortOrder = Enum.SortOrder.LayoutOrder,
        Parent = WIN.container,
    })
    
    WIN.padder = self:Create('UIPadding', {
        Name = 'Padding',
        PaddingLeft = UDim.new(0, 10),
        PaddingTop = UDim.new(0, 5),
        Parent = WIN.container,
    })

    self:Create('Frame', {
        Name = 'Underline',
        Size = UDim2.new(1, 0, 0, 1),
        Position = UDim2.new(0, 0, 1, -1),
        BorderSizePixel = 0,
        BackgroundColor3 = cfg.underline,
        Parent = WIN.frame,
    })

    local toggle = self:Create('TextButton', {
        Name = 'Toggle',
        ZIndex = 2,
        BackgroundTransparency = 1,
        Position = UDim2.new(1, -25, 0, 0),
        Size = UDim2.new(0, 25, 1, 0),
        Text = '-',
        TextSize = 17,
        TextColor3 = cfg.txtcolor,
        Font = Enum.Font.FredokaOne,
        Parent = WIN.frame,
    })

    toggle.MouseButton1Click:connect(function()
        WIN.closed = not WIN.closed
        toggle.Text = WIN.closed and '+' or '-'

        if WIN.closed then
            WIN:Resize(true, UDim2.new(1, 0, 0, 0))
        else
            WIN:Resize(true)
        end
    end)
    
    self:Create('TextLabel', {
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundTransparency = 1,
        BorderSizePixel = 0,
        TextColor3 = cfg.txtcolor,
        TextSize = 17,
        Font = Enum.Font.FredokaOne,
        Text = cfg.text or 'window',
        Name = 'Window',
        Parent = WIN.frame,
    })
    
    DRAG.new(WIN.frame)
    RESIZE.new(WIN.background, WIN.container)

    local function getsize()
        local total = 0

        for _, child in WIN.container:GetChildren() do
            if not (child:IsA('UIListLayout') or child:IsA('UIPadding')) then
                total += child.AbsoluteSize.Y
            end
        end

        return UDim2.new(1, 0, 0, total + 10)
    end

    function WIN.Resize(self, tween, size)
        local newsize = size or getsize()

        self.container.ClipsDescendants = true

        if tween then
            self.background:TweenSize(newsize, 'Out', 'Sine', 0.5, true)
        else
            self.background.Size = newsize
        end
    end
    
    function WIN.AddToggle(self, text, callback)
        self.count += 1

        local cb = callback or function() end
        
        local label = LIB:Create('TextLabel', {
            Text = text,
            Size = UDim2.new(1, -10, 0, 20),
            BackgroundTransparency = 1,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextXAlignment = Enum.TextXAlignment.Left,
            LayoutOrder = self.Count,
            TextSize = 14,
            Font = Enum.Font.FredokaOne,
            Parent = self.container,
        })
        
        local btn = LIB:Create('TextButton', {
            Text = 'OFF',
            TextColor3 = Color3.fromRGB(255, 25, 25),
            BackgroundTransparency = 1,
            Position = UDim2.new(1, -25, 0, 0),
            Size = UDim2.new(0, 25, 1, 0),
            TextSize = 17,
            Font = Enum.Font.FredokaOne,
            Parent = label,
        })

        btn.MouseButton1Click:connect(function()
            self.toggles[text] = not self.toggles[text]
            btn.TextColor3 = self.toggles[text] and Color3.fromRGB(0, 255, 140) or Color3.fromRGB(255, 25, 25)
            btn.Text = self.toggles[text] and 'ON' or 'OFF'

            cb(self.toggles[text])
        end)
        
        self:Resize()

        return btn
    end
    
    function WIN.AddBox(self, placeholder, callback)
        self.count += 1

        local cb = callback or function() end
        
        local box = LIB:Create('TextBox', {
            PlaceholderText = placeholder,
            Size = UDim2.new(1, -10, 0, 20),
            BackgroundTransparency = 0.75,
            BackgroundColor3 = cfg.boxcolor,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextXAlignment = Enum.TextXAlignment.Center,
            TextSize = 14,
            Text = '',
            Font = Enum.Font.FredokaOne,
            LayoutOrder = self.Count,
            BorderSizePixel = 0,
            Parent = self.container,
        })

        box.FocusLost:connect(function(...)
            cb(box, ...)
        end)
        
        self:Resize()

        return box
    end
    
    function WIN.AddButton(self, text, callback)
        self.count += 1

        local btn = LIB:Create('TextButton', {
            Text = text,
            Size = UDim2.new(1, -10, 0, 20),
            BackgroundTransparency = 1,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextXAlignment = Enum.TextXAlignment.Left,
            TextSize = 14,
            Font = Enum.Font.FredokaOne,
            LayoutOrder = self.Count,
            Parent = self.container,
        })

        btn.MouseButton1Click:connect(callback or function() end)
        
        self:Resize()

        return btn
    end
    
    function WIN.AddLabel(self, text)
        self.count += 1

        local textsize = game:GetService('TextService'):GetTextSize(text, 16, Enum.Font.FredokaOne, Vector2.new(math.huge, math.huge))
        
        local label = LIB:Create('TextLabel', {
            Text = text,
            Size = UDim2.new(1, -10, 0, textsize.Y + 5),
            TextScaled = false,
            BackgroundTransparency = 1,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextXAlignment = Enum.TextXAlignment.Left,
            TextSize = 14,
            Font = Enum.Font.FredokaOne,
            LayoutOrder = self.Count,
            Parent = self.container,
        })

        self:Resize()

        return label
    end
    
    function WIN.AddDropdown(self, options, callback)
        self.count += 1

        local selected = options[1] or ''
        local cb = callback or function() end
        
        local label = LIB:Create('TextLabel', {
            Size = UDim2.new(1, -10, 0, 20),
            BackgroundTransparency = 0.75,
            BackgroundColor3 = options.boxcolor,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextXAlignment = Enum.TextXAlignment.Center,
            TextSize = 14,
            Text = selected,
            Font = Enum.Font.FredokaOne,
            BorderSizePixel = 0,
            LayoutOrder = self.Count,
            Parent = self.container,
        })
        
        local arrow = LIB:Create('ImageButton', {
            BackgroundTransparency = 1,
            Image = 'rbxassetid://3234893186',
            Size = UDim2.new(0, 18, 1, 0),
            Position = UDim2.new(1, -20, 0, 0),
            Parent = label,
        })
        
        local dropdown

        local function inmouse(obj)
            local pos = game:GetService('UserInputService'):GetMouseLocation()
            local mousepos = Vector2.new(pos.X, pos.Y - 36)
            
            return obj.AbsolutePosition.X <= mousepos.X and mousepos.X <= obj.AbsolutePosition.X + obj.AbsoluteSize.X and obj.AbsolutePosition.Y <= mousepos.Y and mousepos.Y <= obj.AbsolutePosition.Y + obj.AbsoluteSize.Y
        end

        local function count(t)
            local n = 0
            for _ in t do
                n += 1
            end
            return n
        end

        arrow.MouseButton1Click:connect(function()
            if count(options) ~= 0 then
                if dropdown then
                    dropdown:Destroy()
                    dropdown = nil
                end

                self.container.ClipsDescendants = false
                
                dropdown = LIB:Create('Frame', {
                    Position = UDim2.new(0, 0, 1, 0),
                    BackgroundColor3 = Color3.fromRGB(0, 255, 255),
                    Size = UDim2.new(0, label.AbsoluteSize.X, 0, count(options) * 21),
                    BorderSizePixel = 0,
                    Parent = label,
                    ClipsDescendants = true,
                    ZIndex = 2,
                })

                LIB:Create('UIListLayout', {
                    Name = 'Layout',
                    Parent = dropdown,
                })

                for _, option in options do
                    LIB:Create('TextButton', {
                        Text = option,
                        BackgroundColor3 = Color3.fromRGB(40, 40, 40),
                        TextColor3 = Color3.fromRGB(255, 255, 255),
                        BorderSizePixel = 0,
                        TextSize = 14,
                        Font = Enum.Font.FredokaOne,
                        Size = UDim2.new(1, 0, 0, 21),
                        Parent = dropdown,
                        ZIndex = 2,
                    }).MouseButton1Click:connect(function()
                        label.Text = option
                        cb(option)
                        dropdown.Size = UDim2.new(1, 0, 0, 0)
                        game:GetService('Debris'):AddItem(dropdown, 0.1)
                    end)
                end
            end
        end)
        
        game:GetService('UserInputService').InputBegan:connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 and dropdown and not inmouse(dropdown) then
                game:GetService('Debris'):AddItem(dropdown)
            end
        end)
        
        cb(selected)
        self:Resize()

        return {
            Refresh = function(_, newoptions)
                game:GetService('Debris'):AddItem(dropdown)
                options = newoptions
                label.Text = options[1]
            end,
        }
    end

    return WIN
end

return LIB
