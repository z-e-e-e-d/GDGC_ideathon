import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  Users,
  Building2,
  Upload,
  FileText,
  Crown,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../contexts/AuthContextTypes";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";

const Register = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("player");
  const [playerType, setPlayerType] = useState<"captain" | "regularPlayer">("regularPlayer");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);

  const { registerPlayer, registerOwner } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "player" || roleParam === "owner") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, JPEG, or PNG files only.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    setDocumentFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    // Document validation for owners
    if (role === "owner" && !documentFile) {
      toast({
        title: "Document required",
        description: "Please upload a verification document for owner registration.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (role === "player") {
        // Use the selected playerType as the role for the backend
        await registerPlayer(
          email,
          password,
          name,
          playerType, // Send "captain" or "regularPlayer" as the role
          "DEF",
          "beginner",
          18
        );
      } else {
        const formData = new FormData();
        formData.append("fullName", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("role", role);
        
        // Append file if exists (for owners)
        if (documentFile) {
          formData.append("document", documentFile);
        }
        
        await registerOwner(formData);
      }

      toast({
        title: "Account created!",
        description: role === "owner" 
          ? "Your owner account has been created. Verification is pending." 
          : playerType === "captain"
            ? "Welcome Captain! You can now create and manage teams."
            : "Welcome to KoraLink! Start exploring and joining matches.",
      });

      navigate(role === "player" ? "/player" : "/owner", { replace: true });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex flex-1 bg-gradient-pitch items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pitch-pattern opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 text-center p-12">
          <h2 className="font-display text-4xl text-white mb-4">
            Join the Game
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Create your account and start booking stadiums or managing your
            pitch today.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display text-lg">
                K
              </span>
            </div>
            <span className="font-display text-xl text-foreground">
              Kora<span className="text-primary">Link</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl text-foreground mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground mb-8">
            Join KoraLink and start your football journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("player")}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    role === "player"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <Users
                    className={`w-8 h-8 ${
                      role === "player"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      role === "player" ? "text-primary" : "text-foreground"
                    }`}
                  >
                    Player
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    role === "owner"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <Building2
                    className={`w-8 h-8 ${
                      role === "owner"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      role === "owner" ? "text-primary" : "text-foreground"
                    }`}
                  >
                    Stadium Owner
                  </span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-input border-border"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border"
                  required
                />
              </div>
            </div>

            {/* Player Type Selection (Only for Players) */}
            {role === "player" && (
              <div className="space-y-2">
                <Label>Player Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPlayerType("regularPlayer")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      playerType === "regularPlayer"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-border bg-card hover:border-blue-500/50"
                    }`}
                  >
                    <UserIcon
                      className={`w-8 h-8 ${
                        playerType === "regularPlayer"
                          ? "text-blue-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        playerType === "regularPlayer" ? "text-blue-500" : "text-foreground"
                      }`}
                    >
                      Regular Player
                    </span>
                    <p className="text-xs text-muted-foreground text-center">
                      Join teams and matches
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlayerType("captain")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      playerType === "captain"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                        : "border-border bg-card hover:border-amber-500/50"
                    }`}
                  >
                    <Crown
                      className={`w-8 h-8 ${
                        playerType === "captain"
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        playerType === "captain" ? "text-amber-500" : "text-foreground"
                      }`}
                    >
                      Captain
                    </span>
                    <p className="text-xs text-muted-foreground text-center">
                      Create and manage teams
                    </p>
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {playerType === "captain" 
                    ? "As a captain, you can create teams, invite players, and manage matches."
                    : "As a regular player, you can join teams and participate in matches."}
                </p>
              </div>
            )}

            {/* Verification Document Upload (Only for Owners) */}
            {role === "owner" && (
              <div className="space-y-2">
                <Label>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Verification Document
                  </div>
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="document"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-card hover:bg-accent transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground">
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, PNG, JPG (Max 5MB)
                        </p>
                      </div>
                      <input
                        id="document"
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleDocumentUpload}
                        required={role === "owner"}
                      />
                    </label>
                  </div>

                  {documentFile && (
                    <div className="p-3 border border-border rounded-lg bg-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{documentFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDocumentFile(null);
                            setDocumentPreview(null);
                          }}
                          className="text-sm text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      {documentPreview && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                          <img
                            src={documentPreview}
                            alt="Document preview"
                            className="max-h-32 rounded border border-border mx-auto"
                          />
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        Required for owner verification. Upload your business license, ID, or other official document.
                      </p>
                    </div>
                  )}

                  {/* Verification Notice for Owners */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 text-sm mb-1">
                      Verification Required for Owners
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Your account will be reviewed by our team. You'll be notified once verified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-input border-border"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-input border-border"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;