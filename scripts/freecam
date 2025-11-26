local FreeCam = {}
FreeCam.Enabled = false

local PI = math.pi
local ABS = math.abs
local CLAMP = math.clamp
local EXP = math.exp
local RAD = math.rad
local SIGN = math.sign
local SQRT = math.sqrt
local TAN = math.tan

local CAS = game:GetService("ContextActionService")
local Players = game:GetService("Players")
local RS = game:GetService("RunService")
local SG = game:GetService("StarterGui")
local UIS = game:GetService("UserInputService")

local LP = Players.LocalPlayer
local Camera = workspace.CurrentCamera

local Spring = {}
Spring.__index = Spring

function Spring.new(freq, pos)
	local self = setmetatable({}, Spring)
	self.f = freq
	self.p = pos
	self.v = pos * 0
	return self
end

function Spring:Update(dt, goal)
	local f = self.f * 2 * PI
	local p0 = self.p
	local v0 = self.v
	local offset = goal - p0
	local decay = EXP(-f * dt)
	local p1 = goal + (v0 * dt - offset * (f * dt + 1)) * decay
	local v1 = (f * dt * (offset * f - v0) + v0) * decay
	self.p = p1
	self.v = v1
	return p1
end

function Spring:Reset(pos)
	self.p = pos
	self.v = pos * 0
end

local velSpring = Spring.new(1.5, Vector3.new())
local panSpring = Spring.new(1, Vector2.new())
local fovSpring = Spring.new(4, 0)

local Input = {}
local NAV_KEYBOARD_SPEED = Vector3.new(1, 1, 1) * 64
local PAN_MOUSE_SPEED = Vector2.new(0.75, 1) * 8
local FOV_WHEEL_SPEED = 300
local MAX_PITCH = RAD(90)

local gamepad = {
	ButtonX = 0,
	ButtonY = 0,
	DPadDown = 0,
	DPadUp = 0,
	ButtonL2 = 0,
	ButtonR2 = 0,
	Thumbstick1 = Vector2.new(),
	Thumbstick2 = Vector2.new()
}

local keyboard = {
	W = 0, A = 0, S = 0, D = 0, E = 0, Q = 0,
	U = 0, H = 0, J = 0, K = 0, I = 0, Y = 0,
	Up = 0, Down = 0, LeftShift = 0, RightShift = 0
}

local mouse = {
	Delta = Vector2.new(),
	MouseWheel = 0
}

local function Axis(n)
	return SIGN(n) * CLAMP(ABS(n) - 0.15, 0, 1) / 0.85
end

function Input.Vel(dt)
	local kSpeed = Vector3.new(keyboard.D - keyboard.A, keyboard.E - keyboard.Q, keyboard.S - keyboard.W)
	return kSpeed
end

function Input.Pan()
	local mDelta = mouse.Delta * Vector2.new(1, 1) * (PI / 64)
	mouse.Delta = Vector2.new()
	return mDelta
end

function Input.Fov()
	local wheel = mouse.MouseWheel
	mouse.MouseWheel = 0
	return wheel
end

local function KeyboardInput(_, state, input)
	keyboard[input.KeyCode.Name] = state == Enum.UserInputState.Begin and 1 or 0
	return Enum.ContextActionResult.Sink
end

local function MousePanInput(_, _, input)
	local delta = input.Delta
	mouse.Delta = Vector2.new(-delta.y, -delta.x)
	return Enum.ContextActionResult.Sink
end

local function MouseWheelInput(_, _, input)
	mouse[input.UserInputType.Name] = -input.Position.z
	return Enum.ContextActionResult.Sink
end

function Input.StartCapture()
	CAS:BindActionAtPriority("FreecamKeyboard", KeyboardInput, false, 3000, Enum.KeyCode.W, Enum.KeyCode.A, Enum.KeyCode.S, Enum.KeyCode.D, Enum.KeyCode.E, Enum.KeyCode.Q, Enum.KeyCode.Up, Enum.KeyCode.Down)
	CAS:BindActionAtPriority("FreecamMousePan", MousePanInput, false, 3000, Enum.UserInputType.MouseMovement)
	CAS:BindActionAtPriority("FreecamMouseWheel", MouseWheelInput, false, 3000, Enum.UserInputType.MouseWheel)
end

function Input.StopCapture()
	CAS:UnbindAction("FreecamKeyboard")
	CAS:UnbindAction("FreecamMousePan")
	CAS:UnbindAction("FreecamMouseWheel")
	for k in pairs(keyboard) do keyboard[k] = 0 end
	for k in pairs(mouse) do mouse[k] = type(mouse[k]) == "number" and 0 or Vector2.new() end
end

local cameraPos = Vector3.new()
local cameraRot = Vector2.new()
local cameraFov = 0

local function StepFreecam(dt)
	local vel = velSpring:Update(dt, Input.Vel(dt))
	local pan = panSpring:Update(dt, Input.Pan())
	local fov = fovSpring:Update(dt, Input.Fov())
	
	cameraFov = CLAMP(cameraFov + fov * FOV_WHEEL_SPEED * dt, 1, 120)
	cameraRot = cameraRot + pan * PAN_MOUSE_SPEED * dt
	cameraRot = Vector2.new(CLAMP(cameraRot.x, -MAX_PITCH, MAX_PITCH), cameraRot.y % (2 * PI))
	
	local cf = CFrame.new(cameraPos) * CFrame.fromOrientation(cameraRot.x, cameraRot.y, 0) * CFrame.new(vel * NAV_KEYBOARD_SPEED * dt)
	cameraPos = cf.p
	
	Camera.CFrame = cf
	Camera.Focus = cf
	Camera.FieldOfView = cameraFov
end

local savedProps = {}

function FreeCam:Enable()
	if self.Enabled then return end
	self.Enabled = true
	
	savedProps.CameraType = Camera.CameraType
	savedProps.CameraSubject = Camera.CameraSubject
	savedProps.FieldOfView = Camera.FieldOfView
	savedProps.CFrame = Camera.CFrame
	savedProps.Focus = Camera.Focus
	
	local cf = Camera.CFrame
	cameraRot = Vector2.new(cf:toEulerAnglesYXZ())
	cameraPos = cf.p
	cameraFov = Camera.FieldOfView
	
	velSpring:Reset(Vector3.new())
	panSpring:Reset(Vector2.new())
	fovSpring:Reset(0)
	
	Camera.CameraType = Enum.CameraType.Custom
	Camera.CameraSubject = nil
	Camera.FieldOfView = 70
	
	RS:BindToRenderStep("Freecam", Enum.RenderPriority.Camera.Value, StepFreecam)
	Input.StartCapture()
end

function FreeCam:Disable()
	if not self.Enabled then return end
	self.Enabled = false
	
	Input.StopCapture()
	RS:UnbindFromRenderStep("Freecam")
	
	Camera.CameraType = savedProps.CameraType
	Camera.CameraSubject = savedProps.CameraSubject
	Camera.FieldOfView = savedProps.FieldOfView
	Camera.CFrame = savedProps.CFrame
	Camera.Focus = savedProps.Focus
end

return FreeCam
