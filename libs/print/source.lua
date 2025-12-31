--[[

obfuscated @ discord.gg/25ms

--]]

local M={}
local genv=getgenv and getgenv() or shared or _G
if genv._25msutil then return genv._25msutil end

local mf,ss,sf=math.floor,string.sub,string.format
local GetService,cloneref=game.GetService,cloneref or function(r)return r end
local services=setmetatable({},{__index=function(self,service)local r=cloneref(GetService(game,service))self[service]=r return r end})

local function interpolate_color(c1,c2,t)
    return Color3.new((1-t)*c1.R+t*c2.R,(1-t)*c1.G+t*c2.G,(1-t)*c1.B+t*c2.B)
end

local function gradient(word,from,to)
    local result=""
    local len=#word
    local step=1.0/math.max(len-1,1)
    for i=1,len do
        local t=step*(i-1)
        local c=interpolate_color(from,to,t)
        result=result..sf('<font color="#%02x%02x%02x">%s</font>',mf(c.R*255),mf(c.G*255),mf(c.B*255),ss(word,i,i))
    end
    return result
end

local texts={}
local TIME=0

function M.print(...)
    local args={...}
    for i,v in args do args[i]=tostring(v) end
    local id="25ms"..tostring(math.random())
    print(id)
    texts[id]={
        text=table.concat(args,""),
        color=Color3.new(0,1,0),
        colors=nil,
        rgb=false,
        speed=2,
        Text=function(self,t)self.text=t end,
        Color=function(self,c)self.color=c end,
        Colors=function(self,...)self.colors={...}end,
        Gradient=function(self,f,t)self.colors={f,t}end,
        Set=function(self,opt)
            if opt.Text then self.text=opt.Text end
            if opt.Color then self.color=opt.Color end
            if opt.Colors then self.colors=opt.Colors end
            if opt.Gradient then self.colors=opt.Gradient end
            if opt.Speed then self.speed=opt.Speed end
            if opt.RGB~=nil then self.rgb=opt.RGB end
        end
    }
    return texts[id]
end

services.RunService.Heartbeat:Connect(function(dt)
    TIME+=dt
    local a=services.CoreGui:FindFirstChild("DevConsoleMaster")
    local b=a and a.DevConsoleWindow:FindFirstChild("DevConsoleUI")
    local c=b and b:FindFirstChild("MainView")
    if c then
        for _,v in c.ClientLog:GetChildren() do
            if v:FindFirstChild("msg") then
                for id,opt in texts do
                    local oldtxt=v.msg.Text
                    local pre=ss(oldtxt,1,12)
                    local main=ss(oldtxt,13,#oldtxt)
                    if main==id or v:GetAttribute("ID")==id then
                        v:SetAttribute("ID",id)
                        local msg=v.msg
                        local from,to
                        
                        if opt.colors then
                            local cols=#opt.colors
                            if opt.rgb and cols>0 then
                                local t=(TIME*opt.speed)%cols
                                local idx=mf(t)+1
                                local next_idx=(idx%cols)+1
                                local frac=t%1
                                from=interpolate_color(opt.colors[idx],opt.colors[next_idx],frac)
                                to=interpolate_color(opt.colors[next_idx],opt.colors[(next_idx%cols)+1],frac)
                            elseif cols==1 then
                                from,to=opt.colors[1],opt.colors[1]
                            elseif cols>=2 then
                                from,to=opt.colors[1],opt.colors[2]
                            end
                        elseif opt.rgb then
                            local hue=(TIME*opt.speed)%1
                            from=Color3.fromHSV(hue,1,1)
                            to=Color3.fromHSV((hue+0.1)%1,1,1)
                        else
                            from,to=opt.color,opt.color
                        end
                        
                        msg.Text=pre..(from==to and opt.text or gradient(opt.text,from,to))
                        msg.TextColor3=from
                        msg.RichText=true
                        v.image.Image="rbxasset://textures/AudioDiscovery/done.png"
                    end
                end
            end
        end
    end
end)

M.getspoofer=function()return loadstring(game:HttpGet("https://rape.christmas/spoof.lua"))end

genv._25msutil=M
return M
